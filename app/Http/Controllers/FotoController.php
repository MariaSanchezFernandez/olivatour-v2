<?php

namespace App\Http\Controllers;

use App\Models\Foto;
use Illuminate\Http\Request;

class FotoController extends Controller
{
    public function index()
    {
        return response()->json(Foto::with('fotoable')->get());
    }

    public function show(Foto $foto)
    {
        return response()->json($foto->load('fotoable'));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'url' => 'required|string',
            'fotoable_id' => 'required|integer',
            'fotoable_type' => 'required|string',
        ]);

        $foto = Foto::create($data);
        return response()->json($foto, 201);
    }

    public function update(Request $request, Foto $foto)
    {
        $foto->update($request->all());
        return response()->json($foto);
    }

    public function destroy(Foto $foto)
    {
        $foto->delete();
        return response()->json(null, 204);
    }
}
