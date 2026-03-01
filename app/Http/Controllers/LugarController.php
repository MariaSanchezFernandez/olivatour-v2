<?php

namespace App\Http\Controllers;

use App\Models\LugarInteres;
use App\Models\Poblacion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;

class LugarController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return response()->json(LugarInteres::all());
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\LugarInteres  $lugar
     * @return \Illuminate\Http\Response
     */
    public function show($param)
    {
        // Intentamos buscar por ID primero
        $lugar = LugarInteres::with(['poblacion', 'fotos', 'logro'])
            ->where('id', $param)
            ->orWhere('nombreNormalizado', $param)
            ->first();

        if(!$lugar){
            return response()->json([
                'message' => 'Lugar de interés no encontrado'
            ], 404);
        }

        // Obtener las imágenes relacionadas con el lugar
        $patron = public_path("imagenes/lugaresInteres/imagenes/*{$lugar->nombreNormalizado}*");
        $archivos = File::glob($patron);

        $imagenes = array_map(function ($archivo) {
            return url('imagenes/lugaresInteres/imagenes/' . basename($archivo));
        }, $archivos);

        // Agregar las imágenes a la respuesta
        $lugar->imagenes = $imagenes;

        return response()->json($lugar);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request, LugarInteres $lugar)
    {
        $data = $request->validate([
            'nombre' => 'required|string',
            'descripcionUno' => 'nullable|string',
            'descripcionDos' => 'nullable|string',
            'tipo' => 'required|in:calles,castillos,iglesias,monumentos,museos,paisajes,yacimientos,otro',
            'latitud' => 'required|numeric',
            'longitud' => 'required|numeric',
            'viewport_ne_lat' => 'nullable|numeric',
            'viewport_ne_lng' => 'nullable|numeric',
            'viewport_sw_lat' => 'nullable|numeric',
            'viewport_sw_lng' => 'nullable|numeric',
            'poblacion_id' => 'required|exists:poblaciones,id',
        ]);

        // Normalizar el nombre
        $data['nombreNormalizado'] = $this->normalizarNombre($data['nombre']);

        $lugar = LugarInteres::create($data);

        if(!$lugar)
            return response()->json(['message' => 'Error al crear el punto de interés'], 500);

        return response()->json(['message' => 'Punto de interés creado correctamente', 'lugar' => $lugar], 201);
    }
    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\LugarInteres  $lugar
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, LugarInteres $lugar)
    {
        $data = $request->validate([
            'nombre' => 'sometimes|string',
            'descripcionUno' => 'nullable|string',
            'descripcionDos' => 'nullable|string',
            'tipo' => 'sometimes|in:calles,castillos,iglesias,monumentos,museos,paisajes,yacimientos,otro',
            'latitud' => 'sometimes|numeric',
            'longitud' => 'sometimes|numeric',
            'viewport_ne_lat' => 'nullable|numeric',
            'viewport_ne_lng' => 'nullable|numeric',
            'viewport_sw_lat' => 'nullable|numeric',
            'viewport_sw_lng' => 'nullable|numeric',
            'poblacion_id' => 'sometimes|exists:poblaciones,id',
        ]);

        if(isset($data['nombre']))
            $data['nombreNormalizado'] = $this->normalizarNombre($data['nombre']);

        if(!$lugar->update($data))
            return response()->json(['message' => 'Error al actualizar el punto de interés']);

        return response()->json(['message' => 'Punto de interés actualizado correctamente', 'lugar' => $lugar]);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\LugarInteres  $lugar
     * @return \Illuminate\Http\Response
     */
    public function destroy(Int $id)
    {
        if(LugarInteres::where('id', $id)->delete())
            return response()->json(['message' => 'Punto de interés eliminado correctamente'], 200);

        return response()->json(['message' => 'Error al eliminar el punto de interés'], 500);
    }

    public function showLugaresByPoblacion($param)
    {
        $poblacion = Poblacion::where('id', $param)
            ->orWhere('nombre', $param)
            ->first();

        if(!$poblacion)
            return response()->json(['message' => 'Población no encontrada'], 404);

        $lugares = $poblacion->lugares;

        $lugaresConImagen = $lugares->map(function ($lugar) {
            $rutaImagen = public_path("imagenes/Medallas/{$lugar->tipo}.png");

            $imagenUrl = file_exists($rutaImagen) ? url("imagenes/Medallas/{$lugar->tipo}.png") : null;

            $patron = public_path("imagenes/lugaresInteres/imagenes/*{$lugar->nombreNormalizado}*");

            $archivos = File::glob($patron);

            $imagenes = array_map(function ($archivo) {
                return url('imagenes/lugaresInteres/imagenes/' . basename($archivo));
            }, $archivos);

            return [
                'id' => $lugar->id,
                'nombre' => $lugar->nombre,
                'descripcionUno' => $lugar->descripcionUno,
                'descripcionDos' => $lugar->descripcionDos,
                'tipo' => $lugar->tipo,
                'latitud' => $lugar->latitud,
                'longitud' => $lugar->longitud,
                'imagen_medalla' => $imagenUrl,
                'imagenes' => $imagenes
            ];
        });

        return response()->json($lugaresConImagen);
    }

    function normalizarNombre($cadena) {
        $reemplazos = [
        'á' => 'a', 'é' => 'e', 'í' => 'i', 'ó' => 'o', 'ú' => 'u',
        'ä' => 'a', 'ë' => 'e', 'ï' => 'i', 'ö' => 'o', 'ü' => 'u',
        'à' => 'a', 'è' => 'e', 'ì' => 'i', 'ò' => 'o', 'ù' => 'u',
        'ñ' => 'n', 'ç' => 'c', 'ß' => 'ss', 'œ' => 'oe', 'æ' => 'ae',

        'Á' => 'A', 'É' => 'E', 'Í' => 'I', 'Ó' => 'O', 'Ú' => 'U',
        'Ä' => 'A', 'Ë' => 'E', 'Ï' => 'I', 'Ö' => 'O', 'Ü' => 'U',
        'À' => 'A', 'È' => 'E', 'Ì' => 'I', 'Ò' => 'O', 'Ù' => 'U',

        'Ñ' => 'N', 'Ç' => 'C'
        ];

        
        // Reemplaza los caracteres acentuados y especiales
        $cadena = strtr($cadena, $reemplazos);
        
        // Dividir la cadena en palabras
        $palabras = explode(' ', $cadena);
        $cadenaFinal = '';
        
        foreach ($palabras as $index => $palabra) {
            // Si no es la primera palabra, la primera letra va en mayúsculas y el resto en minúsculas
            if ($index == 0) {
                // La primera palabra empieza con minúscula
                $cadenaFinal .= strtolower($palabra);
            } else {
                // Las siguientes palabras empiezan con mayúscula, respetando las mayúsculas internas
                $cadenaFinal .= ucfirst(strtolower($palabra));
            }
        }
        
        // Remplaza cualquier caracter no alfanumérico (como guiones o puntos) por nada
        $cadenaFinal = preg_replace('/[^a-zA-Z0-9]/', '', $cadenaFinal);
        
        return $cadenaFinal;
    }

}