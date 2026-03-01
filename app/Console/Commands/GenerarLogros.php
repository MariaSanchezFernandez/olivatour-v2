<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Comarca;
use App\Models\Poblacion;
use App\Models\LugarInteres;
use App\Models\Logro;

class GenerarLogros extends Command
{
    protected $signature = 'logros:generar';
    protected $description = 'Genera logros para cada comarca, población y lugar de interés.';

    public function handle()
    {
        $medallas = [
            'calles'       => '/imagenes/medallas/calles.png',
            'castillos'    => '/imagenes/medallas/castillos.png',
            'iglesias'     => '/imagenes/medallas/iglesias.png',
            'monumentos'   => '/imagenes/medallas/monumentos.png',
            'museos'       => '/imagenes/medallas/museos.png',
            'paisajes'     => '/imagenes/medallas/paisajes.png',
            'yacimientos'  => '/imagenes/medallas/yacimientos.png',
            'otro'         => '/imagenes/medallas/otro.png',
        ];

        // comarcas
        $this->info("🔄 Generando logros para comarcas...");
        
        foreach (Comarca::all() as $comarca) {
            if (!$comarca->logro) {
                $comarca->logros()->create([
                    'titulo' => "{$comarca->nombre} visitada", // yo dejaba solo el nombre de la comarca
                    'descripcion' => "Has completado la comarca {$comarca->nombre}.",
                    'icono' => '/imagenes/medallas/calles.png',
                    'tipo' => 'comarca',
                ]);
                $this->info("🟢 Logro creado: {$comarca->nombre}");
            }
        }

        // poblaciones
        $this->info("🔄 Generando logros para poblaciones...");
        foreach (Poblacion::all() as $poblacion) {
            if (!$poblacion->logro) {
                $poblacion->logros()->create([
                    'titulo' => "{$poblacion->nombre} visitada",
                    'descripcion' => "Has explorado la poblacion {$poblacion->nombre}.",
                    'icono' => '/imagenes/medallas/calles.png',
                    'tipo' => 'poblacion',
                ]);
                $this->info("🟢 Logro creado: {$poblacion->nombre}.");
            }
        }

        // lugares de interés
        $this->info("🔄 Generando logros para lugares...");
        foreach (LugarInteres::all() as $lugar) {
            if (!$lugar->logro) {
                
                $imagen = $medallas[$lugar->tipo] ?? '/imagenes/medallas/otro.png';

                $lugar->logro()->create([
                    'titulo' => "{$lugar->nombre} visitado",
                    'descripcion' => "Has visitado el lugar de interés: {$lugar->nombre}.",
                    'icono' => $imagen,
                    'tipo' => 'lugar',	
                ]);

                $this->info("🟢 Logro creado: {$lugar->nombre}.");
            }
        }

        $this->info("✅ Todos los logros han sido generados.");
    }
}
