<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use App\Models\Comarca;
use App\Models\Poblacion;

class PoblacionesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
{
    $json  = File::get(database_path('seeders/data/jsonPoblaciones.json'));
    $items = json_decode($json, true);

    foreach ($items as $key => $data) {
        $res    = $data['detalles']['result'] ?? $data;
        $nombre = $res['name'] ?? $key;
        $slug   = Str::slug($nombre, '-');

        // **1.** Toma el nombre de comarca del JSON (campo 'comarca' o 'result.county')
        $nombreComarca = $data['comarca'] ?? $res['county'] ?? null;

        // **2.** Si existe, búscala (o créala si falta)
        $comarcaId = null;
        if ($nombreComarca) {
            $comarcaId = Comarca::firstOrCreate(
                ['nombre'            => $nombreComarca],
                ['nombreNormalizado' => Str::slug($nombreComarca, '-')]
            )->id;
        }

        // **3.** Ahora crea/actualiza la población con ese comarca_id
        if (isset($res['geometry']['location']['lat']) && isset($res['geometry']['location']['lng'])) {
            Poblacion::updateOrCreate(
                ['nombre' => $nombre],
                [
                    'nombreNormalizado' => $slug,
                    'descripcion1'      => $res['formatted_address'] ?? 'Descripción no disponible',
                    'descripcion2'      => 'Descripción no disponible',
                    'latitud'           => $res['geometry']['location']['lat'],
                    'longitud'          => $res['geometry']['location']['lng'],
                    'viewport_ne_lat'   => $res['geometry']['viewport']['northeast']['lat'] ?? null,
                    'viewport_ne_lng'   => $res['geometry']['viewport']['northeast']['lng'] ?? null,
                    'viewport_sw_lat'   => $res['geometry']['viewport']['southwest']['lat'] ?? null,
                    'viewport_sw_lng'   => $res['geometry']['viewport']['southwest']['lng'] ?? null,
                    'comarca_id'        => $comarcaId,
                ]
            );
        }
    }
}

}