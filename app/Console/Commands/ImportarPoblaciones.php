<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Poblacion;
use App\Models\Comarca;

class ImportarPoblaciones extends Command
{
    protected $signature = 'importar:poblaciones';
    protected $description = 'Importar poblaciones desde un archivo JSON a la base de datos';

    public function handle()
    {
        $jsonFilePath = storage_path('/data/jsonPoblaciones.json');
        $jsonDescripcionesPath = storage_path('/data/descripcionesPoblaciones.json');   /////////////////////////// FALTA EL PATH DEL JSON DESCRIPCIONES

        // Verificar archivos
        if (!file_exists($jsonFilePath)) {
            $this->error('El archivo jsonPoblaciones.json no se encuentra.');
            return;
        }
        if (!file_exists($jsonDescripcionesPath)) {
            $this->error('El archivo descripcionesPoblaciones.json no se encuentra.');
            return;
        }

        // Cargar contenidos
        $poblaciones = json_decode(file_get_contents($jsonFilePath), true);
        $descripciones = json_decode(file_get_contents($jsonDescripcionesPath), true);

        foreach ($poblaciones as $poblacionData) {
            
            // Obtener los datos de la población
            $detalles = $poblacionData['detalles']['result'] ?? [];

            // Obtiene el nombre de la comarca y lo normaliza
            $comarcaNombre = $detalles['county'] ?? null;
            $comarcaNombreNormalizado = $this->normalizarNombre($comarcaNombre);

            // Buscar comarca
            if ($comarcaNombre) {
                $comarca = Comarca::where('nombreNormalizado', $comarcaNombreNormalizado)->first();
                if (!$comarca) {
                    $this->error("Comarca '$comarcaNombre' no encontrada.");
                    continue;
                }
                $comarcaId = $comarca->id;
            } else {
                $comarcaId = null;
            }

            // Recoger datos de la poblacion 
            $nombre = $detalles['address_components'][0]['long_name'] ?? 'Nombre no disponible';
            $nombreNormalizado = $this->normalizarNombre($nombre);

            // Verificar si las descripciones están disponibles en el JSON
            $descripcion1 = $descripciones[$nombre]['descripcion1'] ?? 'Descripción no disponible';

            $descripcion2 = $descripciones[$nombre]['descripcion2'] ?? 'Descripción no disponible';

            $latitud = $detalles['geometry']['location']['lat'] ?? null;
            $longitud = $detalles['geometry']['location']['lng'] ?? null;
            $viewport_ne_lat = $detalles['geometry']['viewport']['northeast']['lat'] ?? null;
            $viewport_ne_lng = $detalles['geometry']['viewport']['northeast']['lng'] ?? null;
            $viewport_sw_lat = $detalles['geometry']['viewport']['southwest']['lat'] ?? null;
            $viewport_sw_lng = $detalles['geometry']['viewport']['southwest']['lng'] ?? null;

            // Verificar que tenemos los datos necesarios
            if (!$latitud || !$longitud) {
                $this->warn("⚠️ Saltando población '$nombre': faltan datos de ubicación");
                continue;
            }

            // Crear o actualizar población
            Poblacion::updateOrCreate(
                ['nombre' => $nombre],
                [
                    'nombreNormalizado' => $nombreNormalizado,
                    'descripcion1' => $descripcion1,
                    'descripcion2' => $descripcion2,
                    'latitud' => $latitud,
                    'longitud' => $longitud,
                    'viewport_ne_lat' => $viewport_ne_lat,
                    'viewport_ne_lng' => $viewport_ne_lng,
                    'viewport_sw_lat' => $viewport_sw_lat,
                    'viewport_sw_lng' => $viewport_sw_lng,
                    'comarca_id' => $comarcaId,
                ]
            );
        }

        $this->info('✅ Poblaciones importadas exitosamente.');
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
