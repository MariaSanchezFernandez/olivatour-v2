<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Poblacion;
use App\Models\LugarInteres;
use Illuminate\Support\Facades\Storage;

class ImportarLugaresInteres extends Command
{
    protected $signature = 'importar:lugares';
    protected $description = 'Importar lugares desde un archivo JSON a la base de datos';

    public function handle()
    {
        $jsonLugaresPath = storage_path('/data/jsonLugaresInteres.json');
        $jsonDescripcionesPath = storage_path('data/descripcionesLugaresInteres.json');   

        if (!file_exists($jsonLugaresPath)) {
            $this->error('El archivo jsonLugaresInteres.json no se encuentra.');
            return;
        }

        if (!file_exists($jsonDescripcionesPath)) {
            $this->error('El archivo descripcionesLugaresInteres.json no se encuentra.');
            return;
        }

        $lugaresData = json_decode(file_get_contents($jsonLugaresPath), true);
        $descripcionesData = json_decode(file_get_contents($jsonDescripcionesPath), true);

        $tiposMap = [
            'route' => 'calles',
            'street_address' => 'calles',
            'intersection' => 'calles',
            'neighborhood' => 'calles',
            'sublocality' => 'calles',
            'premise' => 'calles',

            'castle' => 'castillos',
            'fort' => 'castillos',

            'church' => 'iglesias',
            'place_of_worship' => 'iglesias',
            'mosque' => 'iglesias',
            'synagogue' => 'iglesias',
            'hindu_temple' => 'iglesias',

            'monument' => 'monumentos',
            'tourist_attraction' => 'monumentos',
            'landmark' => 'monumentos',
            'point_of_interest' => 'monumentos',
            'cultural_landmark' => 'monumentos',
            'historical_landmark' => 'monumentos',

            'museum' => 'museos',
            'art_gallery' => 'museos',
            'planetarium' => 'museos',
            'historical_place' => 'museos',

            'natural_feature' => 'paisajes',
            'park' => 'paisajes',
            'botanical_garden' => 'paisajes',
            'lake' => 'paisajes',
            'mountain' => 'paisajes',
            'river' => 'paisajes',
            'national_park' => 'paisajes',
            'state_park' => 'paisajes',
            'campground' => 'paisajes',
            'rv_park' => 'paisajes',
            'beach' => 'paisajes',
            'garden' => 'paisajes',
            'hiking_area' => 'paisajes',

            'archaeological_site' => 'yacimientos',
            'ruin' => 'yacimientos'
        ];

        foreach ($lugaresData as $nombrePoblacion => $lugares) {
            $nombrePoblacionNormalizado = $this->normalizarNombre($nombrePoblacion);
            $poblacion = Poblacion::where('nombreNormalizado', $nombrePoblacionNormalizado)->first();

            if (!$poblacion) {
                $this->warn("Población no encontrada: $nombrePoblacion");
                continue;
            }

            foreach ($lugares as $lugar) {
                $nombre = $lugar['nombre'] ?? 'Nombre no disponible';
                $nombreNormalizado = $this->normalizarNombre($nombre);

                $descripcionUno = $descripcionesData[$lugar['nombre']]['descripcionUno'] ?? 'Sin descripción';
                $descripcionDos = $descripcionesData[$lugar['nombre']]['descripcionDos'] ?? 'Sin descripción';


                $latitud = $lugar['coordenadas']['lat'] ?? null;
                $longitud = $lugar['coordenadas']['lng'] ?? null;
                $poblacionid = $poblacion->id;

                $tipo = 'otro';

                // Comprobamos si el nombre contiene "mirador"
                
                if (stripos($nombre, 'mirador') !== false) {
                    // Si contiene "mirador", se asigna automáticamente el tipo "paisajes"
                    $tipo = 'paisajes';
                } else {
                    // Si no contiene "mirador", seguimos con el proceso anterior
                    $conteoCategorias = [];
                    $tieneIglesia = false;

                    if (isset($lugar['tipos']) && is_array($lugar['tipos'])) {
                        foreach ($lugar['tipos'] as $tipoGoogle) {
                            if (isset($tiposMap[$tipoGoogle])) {
                                $categoria = $tiposMap[$tipoGoogle];

                                if ($categoria === 'iglesias') {
                                    $tieneIglesia = true;
                                }

                                if (!isset($conteoCategorias[$categoria])) {
                                    $conteoCategorias[$categoria] = 0;
                                }

                                $conteoCategorias[$categoria]++;
                            }
                        }

                        if ($tieneIglesia) {
                            $tipo = 'iglesias';
                        } elseif (!empty($conteoCategorias)) {
                            arsort($conteoCategorias);
                            $tipo = array_key_first($conteoCategorias);
                        } else {
                            $tipo = 'otro';
                        }
                    }
                }

                $nuevoLugar = new LugarInteres();
                $nuevoLugar->nombre = $nombre;
                $nuevoLugar->nombreNormalizado = $nombreNormalizado;
                $nuevoLugar->descripcionUno = $descripcionUno;
                $nuevoLugar->descripcionDos = $descripcionDos;
                $nuevoLugar->latitud = $latitud;
                $nuevoLugar->longitud = $longitud;
                $nuevoLugar->tipo = $tipo;
                $nuevoLugar->poblacion_id = $poblacionid;

                try {
                    $nuevoLugar->save();
                    $this->info("✔ Lugar creado: $nombre ({$poblacion->nombre})");
                } catch (\Exception $e) {
                    $this->warn("❌ Error al guardar lugar '$nombre': " . $e->getMessage());
                }
            }
        }

        $this->info('✅ Importación de lugares finalizada.');
    }

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
