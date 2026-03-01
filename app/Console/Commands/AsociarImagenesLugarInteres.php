<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\LugarInteres;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class AsociarImagenesLugarInteres extends Command
{
    protected $signature = 'fotos:asociar-lugares';
    protected $description = 'Asociar las fotos existentes en /public/imagenes/lugar a los lugares de interés';

    public function handle()
    {
        $ruta = public_path('imagenes/lugaresInteres/imagenes');

        if (!File::exists($ruta)) {
            $this->error("❌ No se encontró la carpeta: $ruta");
            return;
        }

        $imagenes = File::files($ruta);
        $this->info("🔍 Se encontraron " . count($imagenes) . " fotos.");

        foreach ($imagenes as $archivo) {
            $nombreArchivo = $archivo->getFilename();
            $nombreBase = Str::beforeLast($nombreArchivo, '_'); // nombrePoblacion_nombreLugar

            // Extraer nombre del lugar (segunda parte del nombre)
            $partes = explode('_', $nombreBase);
            if (count($partes) < 2) {
                $this->warn("⚠️ Formato incorrecto para: $nombreArchivo");
                continue;
            }

            $nombreLugar = $this->normalizarTexto($partes[1]);

            // Buscar el Lugar de Interés por su nombre normalizado
            $lugar = LugarInteres::all()->first(function ($l) use ($nombreLugar) {
                return $this->normalizarTexto($l->nombre) === $nombreLugar;
            });

            if ($lugar) {
                $this->asociarFoto($lugar, $nombreArchivo);
            } else {
                $this->warn("⚠️ No se encontró lugar para la foto: $nombreArchivo");
            }
        }

        $this->info('✅ Asociación de fotos para lugares completada.');
    }

    private function asociarFoto($entidad, $nombreArchivo)
    {
        $urlFoto = "/imagenes/lugaresInteres/imagenes/" . $nombreArchivo;

        if ($entidad->fotos()->where('url', $urlFoto)->exists()) {
            $this->line("✔️ Imagen ya asociada: [$nombreArchivo] a '{$entidad->nombre}'");
            return;
        }

        $entidad->fotos()->create(['url' => $urlFoto]);
        $this->info("🖼️ Foto [$nombreArchivo] asociada a '{$entidad->nombre}'");
    }

    private function normalizarTexto($cadena)
    {
        $cadena = strtolower($cadena);
        $cadena = str_replace(' ', '', $cadena);
        $cadena = strtr($cadena, [
            'á' => 'a', 'é' => 'e', 'í' => 'i', 'ó' => 'o', 'ú' => 'u',
            'à' => 'a', 'è' => 'e', 'ì' => 'i', 'ò' => 'o', 'ù' => 'u',
            'ä' => 'a', 'ë' => 'e', 'ï' => 'i', 'ö' => 'o', 'ü' => 'u',
            'ñ' => 'n', 'ç' => 'c'
        ]);
        return preg_replace('/[^a-z0-9]/', '', $cadena);
    }
}
