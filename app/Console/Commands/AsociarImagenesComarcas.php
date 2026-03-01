<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use App\Models\Comarca;
use Illuminate\Support\Str;

class AsociarImagenesComarcas extends Command
{
    protected $signature = 'fotos:asociar-comarcas';
    protected $description = 'Asociar fotos a las comarcas existentes';

    public function handle()
    {
        $ruta = public_path('imagenes/comarcas/image'); // Ruta donde se encuentran las fotos
        $nombresComarcas = [
            'Campiña de Jaén', 'Comarca de Jaén', 'Sierra Morena', 
            'Condado de Jaén', 'La Loma', 'Las Villas', 
            'Sierra de Cazorla', 'Sierra de Segura', 'Sierra Mágina', 
            'Sierra Sur'
        ];

        // Verifica si la carpeta de imágenes existe
        if (!File::exists($ruta)) {
            $this->error("No se encontró la carpeta: $ruta");
            return;
        }

        // Obtener todas las fotos de la carpeta
        $imagenes = File::files($ruta);
        $this->info("🔍 Se encontraron " . count($imagenes) . " fotos.");

        foreach ($imagenes as $archivo) {
            $nombreArchivo = $archivo->getFilename();
            $nombreComarca = Str::before($nombreArchivo, '.'); // Normaliza el nombre del archivo

            // Normalizar el nombre de la comarca para la comparación
            $nombreComarcaNormalizado = $this->normalizarTexto($nombreComarca);

            // Buscar la comarca en el array de nombres
            $comarca = collect($nombresComarcas)->first(function ($nombre) use ($nombreComarcaNormalizado) {
                return $this->normalizarTexto($nombre) === $nombreComarcaNormalizado;
            });

            if ($comarca) {
                // Asociar la foto a la comarca
                $comarcaExistente = Comarca::where('nombre', $comarca)->first();
                if ($comarcaExistente) {
                    $this->asociarFoto($comarcaExistente, $nombreArchivo);
                }
            } else {
                $this->warn("⚠️ No se encontró comarca para la foto: $nombreArchivo");
            }
        }

        $this->info('✅ Asociación de fotos a comarcas completada.');
    }

    private function asociarFoto($comarca, $nombreArchivo)
    {
        // Ajustar la ruta de la foto
        $urlFoto = "/imagenes/comarcas/image/" . $nombreArchivo;

        // Verificar si la foto ya está asociada
        if ($comarca->fotos()->where('url', $urlFoto)->exists()) {
            $this->line(" Imagen: [$nombreArchivo] ya asociada a '{$comarca->nombre}'");
            return;
        }

        // Asociar la foto
        $comarca->fotos()->create(['url' => $urlFoto]);

        $this->info("✓ Foto [$nombreArchivo] asociada a '{$comarca->nombre}'");
    }

    private function normalizarTexto($cadena)
    {
        // Normalizar el texto para la comparación
        $cadena = strtolower($cadena);
        $cadena = str_replace(' ', '', $cadena);
        $cadena = strtr($cadena, [
            'á' => 'a', 'é' => 'e', 'í' => 'i', 'ó' => 'o', 'ú' => 'u',
            'Á' => 'a', 'É' => 'e', 'Í' => 'i', 'Ó' => 'o', 'Ú' => 'u',
            'ñ' => 'n', 'Ñ' => 'n'
        ]);
        return $cadena;
    }
}
