<?php

namespace App\Http\Controllers;

use App\Models\Comarca;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ComarcaController extends Controller
{
    public function index()
    {
        return response()->json(Comarca::all());
    }

    public function show(Comarca $comarca)
    {
        $comarca = Comarca::where('id', $comarca)->first();

        if (!$comarca)
            return response()->json(['message' => 'Comarca no encontrada'], 404);

        return $comarca;
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nombre' => 'required|string',
            'nombreNormalizado' => 'required|string',
            'latitud' => 'required|numeric',
            'longitud' => 'required|numeric'
        ]);

        $comarca = Comarca::create($data);

        if (!$comarca)
            return response()->json(['message' => 'Error al crear la comarca'], 500);

        return response()->json(['message' => 'Comarca creada correctamente', 'comarca' => $comarca], 201);
    }

    public function update(Request $request, Comarca $comarca)
    {
        // $comarca->update($request->all());
        // return response()->json($comarca);

        $data = $request->validate([
            'nombre' => 'required|string',
            'nombreNormalizado' => 'required|string',
            'latitud' => 'required|numeric',
            'longitud' => 'required|numeric'
        ]);

        if(!$comarca->update($data))
            return response()->json(['message' => 'Error al actualizar la comarca']);

        return response()->json(['message' => 'Comarca actualizada correctamente', 'comarca' => $comarca]);
    }

    public function destroy(Comarca $comarca)
    {
        if (!$comarca)
            return response()->json(['message' => 'Comarca no encontrado'], 404);

        if(!$comarca->delete())
            return response()->json(['message' => 'Error al eliminar la comarca'], 500);

        return response()->json(['message' => 'Comarca eliminada correctamente'], 200);
    }

    // Obtener la lista de poblaciones de una comarca
    public function getPoblacionesDeComarca($param)
    {
        // usa param como id numerica
        // $comarca = Comarca::with('poblaciones')->find($param);

        $comarca = Comarca::with('poblaciones')
            ->where('id', $param)
            ->orWhere('nombre', $param)
            ->first();

        if (!$comarca) {
            return response()->json(['error' => 'Comarca no encontrada'], 404);
        }

        return response()->json($comarca->poblaciones);
    }

    public function getLogrosByComarca($param)
    {
        $comarca = Comarca::with('logros', 'poblaciones.logros', 'poblaciones.lugares.logros')->find($param);

        if (!$comarca) {
            $comarca = Comarca::with('logros', 'poblaciones.logros', 'poblaciones.lugares.logros')
                ->where('nombre', $param)
                ->first();
        }

        // Si no se encuentra la comarca, devolvemos un error
        if (!$comarca) {
            return response()->json(['message' => 'Comarca no encontrada'], 404);
        }

        $logros = [];
        foreach ($comarca->logros as $logro) {
            $logros[] = $logro;
        }

        foreach ($comarca->poblaciones as $poblacion) {
            foreach ($poblacion->logros as $logro) {
                $logros[] = $logro;
            }
            
            foreach ($poblacion->lugares as $lugar) {
                foreach ($lugar->logros as $logro) {
                    $logros[] = $logro;
                }
            }
        }

        // Si no hay logros, devolvemos un mensaje
        if (empty($logros)) {
            return response()->json(['message' => 'No se encontraron logros en esta comarca.'], 404);
        }

        // Devolvemos los logros en formato JSON
        return response()->json($logros);
    }

    // porcentaje de la comarca
    function getPorcentajeComarca($comarcaId, $usuarioId)
    {
        $comarca = Comarca::with('logros', 'poblaciones.logros', 'poblaciones.lugares.logros')->find($comarcaId);
        if(!$comarca)
            return response()->json(['error' => 'Comarca no encontrada'], 404);

        $usuario = DB::table('users')->where('id', $usuarioId)->first();
        if(!$usuario)
            return response()->json(['error' => 'Usuario no encontrado'], 404);

        $logrosTotales = collect();

        $logrosTotales = $logrosTotales->merge($comarca->logros);

        foreach($comarca->poblaciones as $poblacion){
            $logrosTotales = $logrosTotales->merge($poblacion->logros);

            foreach($poblacion->lugares as $lugar){
                $logrosTotales = $logrosTotales->merge($lugar->logros);
            }
        }

        $logrosTotalesIds = $logrosTotales->pluck('id');

        $logrosCompletados = DB::table('usuarios_logros')
            ->where('id_usuario', $usuarioId)
            ->whereIn('id_logro', $logrosTotalesIds)
            ->count();

        $totalLogros = $logrosTotales->count();
        $porcentaje = $totalLogros > 0 ? round(($logrosCompletados / $totalLogros) * 100) : 0;

        return response()->json([
            'comarca' => $comarca->nombre,
            'total_logros' => $totalLogros,
            'logros_completados' => $logrosCompletados,
            'porcentaje' => $porcentaje
        ]);
    }

    public function getComarcaImagen($id = null)
    {
        $comarca = Comarca::with('fotos')->where('id', $id)
            ->orWhere('nombre', $id)
            ->first();

        if(!$comarca)
            return response()->json(['error' => 'Comarca no encontrada'], 404);

        $foto = $comarca->fotos()->first();

        if(!$foto)
            return response()->json(['error' => 'Imagen no encontrada'], 404);

        $imagen = public_path($foto->url);

        if(!file_exists($imagen))
            return response()->json(['error' => 'No se ha encontrado la imagen'], 404);

        return response()->file($imagen);
    }

    public function getComarcasImagenes()
    {
        $comarcas = Comarca::with('fotos')->get();

        if($comarcas->isEmpty())
            return response()->json(['error' => 'No hay comarcas registradas'], 404);

        $imagenes = [];

        foreach ($comarcas as $comarca) {
            $foto = $comarca->fotos()->first();

            $imagenes[] = [
                'id' => $comarca->id,
                'comarca' => $comarca->nombre,
                'imagen' => $foto ? url($foto->url) : null
            ];
        }

        return response()->json($imagenes);
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