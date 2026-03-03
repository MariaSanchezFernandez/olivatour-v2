<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Logro;
use Illuminate\Support\Facades\DB;

class UsuarioLogroController extends Controller
{

    public function showLogrosByUser($usuarioId)
    {
        $usuario = User::find($usuarioId);
        if(!$usuario)
            return response()->json(['error' => 'Usuario no encontrado'], 404);

        $logros = DB::table('usuarios_logros')
            ->join('logros', 'usuarios_logros.id_logro', '=', 'logros.id')
            ->where('usuarios_logros.id_usuario', $usuarioId)
            ->select('logros.*')
            ->get();

        return response()->json($logros);
    }

    public function guardarLogro($usuarioId, $logroId)
    {
        $usuario = User::find($usuarioId);
        if (!$usuario) {
            return response()->json(['error' => 'Usuario no encontrado'], 404);
        }

        $logro = Logro::find($logroId);
        if (!$logro) {
            return response()->json(['error' => 'Logro no encontrado'], 404);
        }

        $query = DB::table('usuarios_logros')
            ->where('id_usuario', $usuarioId)
            ->where('id_logro', $logroId);

        if ($query->exists()) {
            $deleted = $query->delete();
            if ($deleted) {
                return response()->json(['message' => 'Se ha eliminado el logro del usuario: ' . $usuario->name], 200);
            } else {
                return response()->json(['message' => 'Error al eliminar el logro'], 500);
            }
        }

        DB::table('usuarios_logros')->insert([
            'id_usuario' => $usuarioId,
            'id_logro' => $logroId,
            'tipo' => $logro->tipo,
            'fecha_desbloqueo' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json(['message' => 'Logro registrado correctamente'], 201);
    }
}