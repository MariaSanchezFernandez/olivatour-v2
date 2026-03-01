<?php

namespace App\Http\Controllers;

use App\Models\Logro;
use App\Models\Poblacion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;

class LogroController extends Controller
{
    public function index()
    {
        return response()->json(Logro::all());
    }

    public function show($param)
    {
        $logro = Logro::where('id', $param)
            ->orWhere('titulo', $param)
            ->first();

        if (!$logro) {
            return response()->json(['message' => 'Logro no encontrado'], 404);
        }

        return $logro;
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'titulo' => 'required|string',
            'descripcion' => 'nullable|string',
            'tipo' => 'required|in:comarca,poblacion,lugar',
            'logroable_id' => 'required|integer',
            'logroable_type' => 'required|string',
            'icono' => 'nullable|string',
        ]);

        // Mapear el tipo a la clase completa
        $modelMap = [
            'comarca' => \App\Models\Comarca::class,
            'poblacion' => \App\Models\Poblacion::class,
            'lugar' => \App\Models\LugarInteres::class,
        ];

        if (!isset($modelMap[$data['logroable_type']])) {
            return response()->json(['error' => 'Tipo de modelo inválido'], 422);
        }

        // Reemplazamos el string con la clase completa
        $data['logroable_type'] = $modelMap[$data['logroable_type']];

        $logro = Logro::create([
            'titulo' => $data['titulo'],
            'descripcion' => $data['descripcion'],
            'tipo' => $data['tipo'],
            'logroable_id' => $data['logroable_id'],
            'logroable_type' => $data['logroable_type'],
            'icono' => $data['icono'],
        ]);

        return response()->json($logro, 201);
    }

    public function update(Request $request, Logro $logro)
    {
        // $logro->update($request->all());
        // return response()->json($logro);

        $data = $request->validate([
            'titulo' => 'required|string',
            'descripcion' => 'nullable|string',
            'tipo' => 'required|in:comarca,poblacion,lugar',
            'logroable_id' => 'required|integer',
            'logroable_type' => 'required|string',
            'icono' => 'nullable|string',
        ]);

        // Mapear el tipo a la clase completa
        $modelMap = [
            'comarca' => \App\Models\Comarca::class,
            'poblacion' => \App\Models\Poblacion::class,
            'lugar' => \App\Models\LugarInteres::class,
        ];

        if (!isset($modelMap[$data['logroable_type']])) {
            return response()->json(['error' => 'Tipo de modelo inválido'], 422);
        }

        // Reemplazamos el string con la clase completa
        $data['logroable_type'] = $modelMap[$data['logroable_type']];

        if(!$logro->update([
            'titulo' => $data['titulo'],
            'descripcion' => $data['descripcion'],
            'tipo' => $data['tipo'],
            'logroable_id' => $data['logroable_id'],
            'logroable_type' => $data['logroable_type'],
            'icono' => $data['icono'],
        ]))
            return response()->json(['message' => 'Error al actualizar el logro'], 500);

        return response()->json(['message' => 'Logro actualizado correctamente', 'logro' => $logro]);
    }

    public function destroy(Logro $logro)
    {
        if (!$logro)
            return response()->json(['message' => 'Logro no encontrado'], 404);

        if(!$logro->delete())
            return response()->json(['message' => 'Error al eliminar el logro'], 500);

        return response()->json(['message' => 'Logro eliminado correctamente'], 200);
    }

    public function getLogrosByPoblacion($param)
    {
        $poblacion = Poblacion::where('id', $param)
            ->orWhere('nombre', $param)
            ->first();

        if (!$poblacion) {
            return response()->json(['message' => 'Población no encontrada'], 404);
        }

        $logros = $poblacion->logros;

        return response()->json($logros);
    }

    public function getLogrosImagenes()
    {
        $rutaCarpeta = public_path('imagenes/Medallas');

        if (!File::exists($rutaCarpeta)) {
            return response()->json(['error' => 'La carpeta de imágenes no existe'], 404);
        }

        $archivos = File::files($rutaCarpeta);

        $imagenes = [];

        foreach($archivos as $archivo){
            $imagenes[] = [
                'nombre' => $archivo->getFilename(),
                'url' => url('imagenes/Medallas/' . $archivo->getFilename())
            ];
        }

        return response()->json($imagenes);
    }
}