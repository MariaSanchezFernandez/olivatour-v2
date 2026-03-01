<?php
namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return response()->json(User::all());
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function show($param)
    {
        $user = User::where('id', $param)->orWhere('email', $param)->first();

        if (!$user)
            return response()->json(['message' => 'Usuario no encontrado'], 404);

        return $user;
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
            'username' => 'nullable|string|unique:users,username|max:50',
            'name' => 'required|string|max:50',
            'surname' => 'nullable|string|max:50',
            'email' => 'required|email|unique:users,email|max:255',
            'password' => 'required|string|min:6|confirmed',
            'edad' => 'nullable|date',
            'idioma' => 'nullable|integer|min:0|max:10'
        ]);

        $data['password'] = Hash::make($data['password']);

        $user = User::create($data);

        if (!$user)
            return response()->json(['message' => 'Error al crear el usuario'], 500);

        return response()->json(['message' => 'Usuario creado correctamente', 'user' => $user], 201);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\User  $user
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, User $user)
    {
        $data = $request->validate([
            'username' => 'nullable|string|unique:users,username|max:50',
            'name' => 'required|string|max:50',
            'surname' => 'nullable|string|max:50',
            'email' => 'required|email|unique:users,email|max:255',
            'password' => 'required|string|min:6|confirmed',
            'edad' => 'nullable|date',
            'idioma' => 'nullable|integer|min:0|max:10'
        ]);

        if (isset($data['password']))
            $data['password'] = Hash::make($data['password']);

        if(!$user->update($data))
            return response()->json(['message' => 'Error al actualizar el usuario']);

        return response()->json(['message' => 'Usuario actualizado correctamente', 'user' => $user]);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\User  $poblacion
     * @return \Illuminate\Http\Response
     */
    public function destroy(User $user)
    {
        if (!$user)
            return response()->json(['message' => 'Usuario no encontrado'], 404);

        if(!$user->delete())
            return response()->json(['message' => 'Error al eliminar el usuario'], 500);

        return response()->json(['message' => 'Usuario eliminado correctamente'], 200);
    }

    // devuelve una lista de los logros, y si los a conseguido o no
    public function logros($usuarioId)
    {
        $usuario = User::find($usuarioId);

        if (!$usuario) {
            return response()->json(['error' => 'Usuario no encontrado'], 404);
        }

        $logros = $usuario->logros;

        if ($logros->isEmpty()) {
            return response()->json(['message' => 'No se encontraron logros para este usuario.'], 404);
        }

        return response()->json($logros);
    }

    // Registro de usuario en la bdd
    // public function register(Request $request)
    // {
    //     $validated = $request->validate([
    //         'name' => 'required|string|max:255',
    //         'email' => 'required|email|unique:users',
    //         'password' => 'required|min:6|confirmed'
    //     ]);

    //     $user = User::create([
    //         'name' => $validated['name'],
    //         'email' => $validated['email'],
    //         'password' => Hash::make($validated['password']),
    //     ]);

    //     return response()->json(['message' => 'Usuario registrado correctamente'], 201);
    // }

    // Autenticación de usuario
    // Se le asigna un token al usuario para que pueda acceder a la API
    public function login(Request $request)
    {
        $validated = $request->validate([
            'email_or_username' => 'required|string',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $validated['email_or_username'])
                    ->orWhere('username', $validated['email_or_username'])
                    ->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            return response()->json(['error' => 'Las credenciales son incorrectas.'], 401);
        }

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'message' => 'Has iniciado sesión',
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'username' => $user->username,
            ],
        ]);
    }
    
    // cerrar la sesión del usuario
    public function logout(Request $request)
    {
        if (!$request->user()) {
            return response()->json(['error' => 'Usuario no autenticado'], 401);
        }

        $currentToken = $request->user()->currentAccessToken();
        if (!$currentToken) {
            return response()->json(['error' => 'No se encontró un token activo para este usuario'], 404);
        }

        $currentToken->delete();

        return response()->json(['message' => 'Se ha cerrado la sesión']);
    }

    // solicitar recuperación de la contraseña del usuario
    public function forgotPassword(Request $request)
    {
        // Validar el correo electrónico
        $request->validate([
            'email' => 'required|email|exists:users,email',
        ]);

        // Enviar el correo de restablecimiento de contraseña
        $status = Password::sendResetLink(
            $request->only('email')
        );

        if ($status === Password::RESET_LINK_SENT) {
            return response()->json(['message' => 'Se ha enviado un correo para restablecer la contraseña.'], 200);
        }

        return response()->json(['error' => 'No se pudo enviar el correo para restablecer la contraseña.'], 500);
    }

    // restablecer la contraseña del usuario
    public function resetPassword(Request $request)
    {
        // Validar los datos de entrada
        $request->validate([
            'email' => 'required|email|exists:users,email',
            'token' => 'required|string',
            'password' => 'required|string|min:6|confirmed',
        ]);

        // Intentar restablecer la contraseña
        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                $user->forceFill([
                    'password' => Hash::make($password),
                ])->save();
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return response()->json(['message' => 'Contraseña restablecida.'], 200);
        }

        return response()->json(['error' => 'El token no es válido o ha expirado.'], 500);
    }
}