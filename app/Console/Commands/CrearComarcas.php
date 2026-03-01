<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Comarca;

class CrearComarcas extends Command
{
    protected $signature = 'importar:comarcas';
    protected $description = 'Crear comarcas si no existen';

    public function handle()
    {
        // Array de nombres de comarcas que quieres agregar
        $nombresComarcas = [
            'Campiña de Jaén',
            'Comarca de Jaén',
            'Sierra Morena', 
            'Condado de Jaén',
            'La Loma',
            'Las Villas', 
            'Sierra de Cazorla',
            'Sierra de Segura',
            'Sierra Mágina', 
            'Sierra Sur'
        ];
        // Array de coordenadas de comarcas                          ///////  COMPROBAR COORDENADAS ///////
        $coordenadasComarcas = [
            'Campiña de Jaén' => ['latitud' => 37.7667, 'longitud' => -3.8000],
            'Comarca de Jaén' => ['latitud' => 37.7667, 'longitud' => -3.8000],
            'Sierra Morena' => ['latitud' => 38.2000, 'longitud' => -3.5000],
            'Condado de Jaén' => ['latitud' => 38.2000, 'longitud' => -3.4000],
            'La Loma' => ['latitud' => 38.0500, 'longitud' => -3.3500],
            'Las Villas' => ['latitud' => 38.1500, 'longitud' => -2.9500],
            'Sierra de Cazorla' => ['latitud' => 37.9000, 'longitud' => -2.9000],
            'Sierra de Segura' => ['latitud' => 38.2500, 'longitud' => -2.9000],
            'Sierra Mágina' => ['latitud' => 37.8000, 'longitud' => -3.4000],
            'Sierra Sur' => ['latitud' => 37.6000, 'longitud' => -3.9500]
        ];

        

        foreach ($nombresComarcas as $nombre) {
            // Normalizar el nombre de la comarca
            $nombreNormalizado = $this->normalizarNombre($nombre);

             // Verifica si existen coordenadas
            if (!isset($coordenadasComarcas[$nombre])) {
                $this->warn("Coordenadas no definidas para la comarca: $nombre");
                continue;
            }

            $latitud = $coordenadasComarcas[$nombre]['latitud'];
            $longitud = $coordenadasComarcas[$nombre]['longitud'];

            // Crear la comarca si no existe
            Comarca::firstOrCreate([
                'nombre' => $nombre,
                'nombreNormalizado' => $nombreNormalizado,
                'latitud' => $latitud,
                'longitud' => $longitud,
            ]);

        }

        $this->info('✅ Comarcas creadas con éxito.');
    }

    // Función para normalizar el nombre
    private function normalizarNombre($cadena) {
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
