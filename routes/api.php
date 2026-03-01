<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ComarcaController;
use App\Http\Controllers\PoblacionController;
use App\Http\Controllers\LugarController;
use App\Http\Controllers\LogroController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\UsuarioLogroController;
use App\Http\Controllers\ForgotPasswordController;
use App\Http\Controllers\ResetPasswordController;


/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/


// COMARCASgetAllComarcas Copy

Route::apiResource('comarcas', ComarcaController::class);

// Ruta para obtener las poblaciones de una comarca por ID o nombre
Route::get('comarcas/{param}/poblaciones', [ComarcaController::class, 'getPoblacionesDeComarca']);

// Ruta para obtener todos los logros relacionados con una comarca
Route::get('comarcas/{param}/logros', [ComarcaController::class, 'getLogrosByComarca']);

// obtener porcentaje de la comarca
Route::get('/comarcas/{comarcaId}/porcentaje/{usuarioId}', [ComarcaController::class, 'getPorcentajeComarca']);

// imagenes de todas las comarcas
Route::get('/imagenes/comarcas', [ComarcaController::class, 'getComarcasImagenes']);

// imagen de una comarca por id o nombre
Route::get('/comarcas/imagen/{id?}', [ComarcaController::class, 'getComarcaImagen']);


// obtener imagen de la comarca
// Route::get('comarca/{param}/imagen', [ComarcaController::class, 'getFotoPoblacion']);

// POBLACIONES

// Rutas RESTful estándar
Route::apiResource('poblaciones', PoblacionController::class);

Route::get('poblaciones/{param}', [PoblacionController::class, 'show']);

// Ruta para obtener lugares por población (por ID o nombre)
Route::get('poblaciones/{param}/lugares', [PoblacionController::class, 'getLugaresByPoblacion']);

// Ruta para obtener logros por población (por ID o nombre)
Route::get('poblaciones/{param}/logros', [PoblacionController::class, 'getLogrosByPoblacion']);

// imagen de una población por id o nombre
Route::get('/poblaciones/{id}/imagen', [PoblacionController::class, 'getPoblacionImagen']);

// imagenes de todas poblaciones de una comarca
Route::get('/imagenes/poblaciones/{id}', [PoblacionController::class, 'getPoblacionesImagenesPorComarca']);

// escudo de una población por id o nombre
Route::get('/poblaciones/{id}/escudo', [PoblacionController::class, 'getPoblacionEscudo']);

// LUGARES DE INTERÉS

// Rutas RESTful estándar para lugares de interés
Route::apiResource('lugares', LugarController::class);

// Ruta adicional para búsqueda por nombre
Route::get('lugares/{param}', [LugarController::class, 'show']);

// lugares de una poblacion por id o nombre
Route::get('lugares/poblacion/{id}', [LugarController::class, 'showLugaresByPoblacion']);



// LOGROS

// Rutas RESTful estándar para logros
Route::apiResource('logros', LogroController::class);

// imagenes de todos los logros
Route::get('/imagenes/logros', [LogroController::class, 'getLogrosImagenes']);




// Rutas RESTful estándar para usuarios
Route::apiresource('user', UserController::class);

// registrar un usuario
// Route::post('/user/register/', [UserController::class, 'register']);

// registrar un usuario
Route::post('/user/login/', [UserController::class, 'login']);

// cerrar la sesión de un usuario
Route::post('/user/logout/', [UserController::class, 'logout']);

// cerrar sesión de un usuario
Route::get('/user/{usuarioId}/logros/', [UserController::class, 'logros']);

// solicitar recuperación de la contraseña del usuario
Route::post('/password/forgot', [UserController::class, 'forgotPassword']);

// restablecer la contraseña del usuario
Route::post('/password/reset', [UserController::class, 'resetPassword']);





// guardar o eliminar un logro de un usuario
// si no existe el logro se guarda, si existe se elimina
Route::post('/usuarios/{usuarioId}/logros/{logroId}', [UsuarioLogroController::class, 'guardarLogro']);

// obtener los logros de un usuario
Route::get('/usuarios/{usuarioId}/logros', [UsuarioLogroController::class, 'showLogrosByUser']);



Route::post('password/email', [ForgotPasswordController::class, 'sendResetLinkEmail']);

Route::post('password/reset', [ResetPasswordController::class, 'reset']);

// esto que es ??? solo dani lo sabe


// Route::middleware('auth:sanctum')->get('/a_user', function (Request $request) {
//     return $request->user();
// });

