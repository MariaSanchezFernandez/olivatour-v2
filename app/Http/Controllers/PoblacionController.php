<?php

namespace App\Http\Controllers;

use App\Models\Poblacion;
use App\Models\Comarca;
use Illuminate\Http\Request;

class PoblacionController extends Controller{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return response()->json(Poblacion::all());
        // return response()->json(Poblacion::with(['comarca', 'lugares', 'fotos', 'logros'])->get());
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function show($param)
    {
        // Intentamos buscar por ID primero
        $poblacion = Poblacion::with(['comarca', 'lugares', 'fotos', 'logros'])
            ->where('id', $param)
            ->orWhere('nombreNormalizado', $param)
            ->first();

        if (!$poblacion) {
            return response()->json([
                'message' => 'Población no encontrada'
            ], 404);
        }

        return response()->json($poblacion);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'nombre' => 'required|string',
            'descripcion1' => 'nullable|string',
            'descripcion2' => 'nullable|string',
            'latitud' => 'required|numeric',
            'longitud' => 'required|numeric',
            'viewport_ne_lat' => 'nullable|numeric',
            'viewport_ne_lng' => 'nullable|numeric',
            'viewport_sw_lat' => 'nullable|numeric',
            'viewport_sw_lng' => 'nullable|numeric',
            'comarca_id' => 'required|exists:comarcas,id'
        ]);

        $data['nombreNormalizado'] = $this->normalizarNombre($data['nombre']);

        $poblacion = Poblacion::create($data);

        if (!$poblacion)
            return response()->json(['message' => 'Error al crear la población'], 500);

        return response()->json(['message' => 'Población creada correctamente', 'poblacion' => $poblacion], 201);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Poblacion  $poblacion
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, Poblacion $poblacion)
    {
        $data = $request->validate([
            'nombre' => 'required|string',
            'descripcion1' => 'nullable|string',
            'descripcion2' => 'nullable|string',
            'latitud' => 'required|numeric',
            'longitud' => 'required|numeric',
            'viewport_ne_lat' => 'nullable|numeric',
            'viewport_ne_lng' => 'nullable|numeric',
            'viewport_sw_lat' => 'nullable|numeric',
            'viewport_sw_lng' => 'nullable|numeric',
            'comarca_id' => 'required|exists:comarcas,id'
        ]);

        $data['nombreNormalizado'] = $this->normalizarNombre($data['nombre']);

        if (!$poblacion->update($data)) {
            return response()->json(['message' => 'Error al actualizar la población'], 500);
        }

        return response()->json(['message' => 'Población actualizada correctamente', 'poblacion' => $poblacion]);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Poblacion  $poblacion
     * @return \Illuminate\Http\Response
     */
    public function destroy(Poblacion $poblacion)
    {
        try {
            // Eliminar lugares relacionados
            $poblacion->lugares()->delete();

            // Eliminar logros relacionados
            $poblacion->logros()->delete();

            // Intentamos eliminar la población
            $poblacion->delete();
            return response()->json(['message' => 'Población eliminada correctamente'], 200);
        } catch (\Exception $e) {
            // Si ocurre un error, devolvemos un mensaje de error
            return response()->json(['message' => 'Error al eliminar la población', 'error' => $e->getMessage()], 500);
        }
    }

    // Obtener lugares de interés por población
    public function getLugaresByPoblacion($param)
    {
        // Intentamos buscar la población por ID
        $poblacion = Poblacion::with(['lugares', 'lugares.fotos', 'lugares.logro'])->find($param);
        // Si no encontramos por ID, buscamos por nombre
        if (!$poblacion) {
            $poblacion = Poblacion::with(['lugares', 'lugares.fotos', 'lugares.logro'])
                ->where('nombre', $param)
                ->first();
        }

        if (!$poblacion) {
            return response()->json(['message' => 'Población no encontrada'], 404);
        }

        return response()->json($poblacion->lugares);
    }


    public function getLogrosByPoblacion($param)
    {
        // Intentamos buscar la población por ID
        $poblacion = Poblacion::with('logros', 'lugares.logros')->find($param);

        // Si no encontramos por ID, buscamos por nombre
        if (!$poblacion) {
            $poblacion = Poblacion::with('logros', 'lugares.logros')
                ->where('nombre', $param)
                ->first();
        }

        // Si no se encuentra la población, devolvemos un error
        if (!$poblacion) {
            return response()->json(['message' => 'Población no encontrada'], 404);
        }

        // Crear un array para almacenar todos los logros
        $logros = [];

        // Agregar los logros de la población
        foreach ($poblacion->logros as $logro) {
            $logros[] = $logro;
        }

        // Agregar los logros de los lugares asociados a la población
        if ($poblacion->lugares) {
            foreach ($poblacion->lugares as $lugar) {
                if ($lugar->logros) {
                    foreach ($lugar->logros as $logro) {
                        $logros[] = $logro;
                    }
                }
            }
        }

        // Si no hay logros, devolvemos un mensaje
        if (empty($logros)) {
            return response()->json(['message' => 'No se encontraron logros en esta población.'], 404);
        }

        // Devolvemos los logros en formato JSON
        return response()->json($logros);
    }

    public function getPoblacionImagen($id)
    {
        $poblacion = Poblacion::where('id', $id)
            ->orWhere('nombre', $id)
            ->first();

        if (!$poblacion) {
            return response()->json(['error' => 'Población no encontrada'], 404);
        }

        $rutaImagen = public_path("imagenes/poblacion/imagen_escudo/{$poblacion->nombre}.png");

        if (!file_exists($rutaImagen)) {
            return response()->json(['error' => 'Imagen no encontrada'], 404);
        }

        return response()->file($rutaImagen);
    }

    public function getPoblacionesImagenesPorComarca($id)
    {
        $comarca = Comarca::with('poblaciones.fotos')->where('id', $id)
            ->orWhere('nombre', $id)
            ->first();

        if(!$comarca)
            return response()->json(['error' => 'Comarca no encontrada'], 404);

        // Obtener las poblaciones asociadas a la comarca
        $poblaciones = $comarca->poblaciones;

        if($poblaciones->isEmpty())
            return response()->json(['error' => 'No hay poblaciones registradas para esta comarca'], 404);

        $imagenes = [];

        foreach($poblaciones as $poblacion){
            // imagen_escudo y escudo son campos directos del modelo (no file_exists)
            $imagen = $poblacion->imagen_escudo ?? $poblacion->escudo ?? null;

            $imagenes[] = [
                'id' => $poblacion->id,
                'poblacion' => $poblacion->nombre,
                'imagen' => $imagen
            ];
        }

        return response()->json($imagenes);
    }

    public function getPoblacionEscudo($id)
    {
        $poblacion = Poblacion::with('fotos')->where('id', $id)
            ->orWhere('nombre', $id)
            ->first();

        if(!$poblacion)
            return response()->json(['error' => 'Población no encontrada'], 404);

        $rutaImagen = public_path("imagenes/poblacion/escudos/Escudo{$poblacion->nombre}.png");
        
        if(!file_exists($rutaImagen))
            return response()->json(['error' => 'Imagen no encontrada'], 404);

        return response()->file($rutaImagen);
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