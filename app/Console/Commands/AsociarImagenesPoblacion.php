<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use App\Models\Poblacion;

class AsociarImagenesPoblacion extends Command
{
    protected $signature = 'fotos:asociar-poblaciones';
    protected $description = 'Asociar fotos a poblaciones desde las carpetas respectivas';

    public function handle()
    {
        $this->asociarFotosGenerales();
        $this->asociarEscudos();
        $this->asociarImagenEscudo();

        $this->info("✅ Asociación de imágenes completada.");
    }

    private function asociarFotosGenerales()
    {
        $rutaFotos = public_path('imagenes/poblacion/poblacionImagenes');

        if (!File::exists($rutaFotos)) {
            $this->warn("📂 No se encontró la carpeta de fotos generales: $rutaFotos");
            return;
        }

        $fotos = File::files($rutaFotos);
        $this->info("📸 Se encontraron " . count($fotos) . " fotos generales.");

        foreach ($fotos as $archivo) {
            $nombreArchivo = $archivo->getFilename();
            $nombreBase = Str::before($nombreArchivo, '_'); // Extraer antes del _

            $nombrePoblacion = $nombreBase; // Ya está normalizado

            $entidad = $this->buscarEntidad($nombrePoblacion);

            if (!$entidad) {
                $this->warn("⚠️ No se encontró población para la foto: $nombreArchivo");
                continue;
            }

            $url = '/imagenes/poblacion/poblacionImagenes/' . $nombreArchivo;

            if ($entidad->fotos()->where('url', $url)->exists()) {
                $this->line("✔️ Foto ya asociada a '{$entidad->nombre}': $nombreArchivo");
                continue;
            }

            $entidad->fotos()->create(['url' => $url]);
            $this->info("🖼️ Foto asociada a '{$entidad->nombre}': $nombreArchivo");
        }
    }

    private function asociarEscudos()
    {
        $rutaEscudos = public_path('imagenes/poblacion/escudos');

        if (!File::exists($rutaEscudos)) {
            $this->warn("📂 No se encontró la carpeta de escudos: $rutaEscudos");
            return;
        }

        $escudos = File::files($rutaEscudos);
        $this->info("🛡️ Se encontraron " . count($escudos) . " escudos.");

        foreach ($escudos as $archivo) {
            $nombreArchivo = $archivo->getFilename();
            $nombreBase = Str::before($nombreArchivo, '.'); // e.g., EscudoZaragoza
            $nombreNormalizado = Str::after($nombreBase, 'Escudo'); // e.g., Zaragoza

            $entidad = $this->buscarEntidad($nombreNormalizado);

            if (!$entidad) {
                $this->warn("⚠️ No se encontró población para el escudo: $nombreArchivo");
                continue;
            }

            $url = '/imagenes/poblacion/escudos/' . $nombreArchivo;

            if ($entidad->escudo !== $url) {
                $entidad->update(['escudo' => $url]);
                $this->info("🛡️ Escudo actualizado para '{$entidad->nombre}'");
            }

            if (!$entidad->fotos()->where('url', $url)->exists()) {
                $entidad->fotos()->create(['url' => $url]);
                $this->info("📷 Escudo guardado como foto para '{$entidad->nombre}'");
            }
        }
    }

    private function asociarImagenEscudo()
    {
        $rutaImagenEscudo = public_path('imagenes/poblacion/imagen_escudo');

        if (!File::exists($rutaImagenEscudo)) {
            $this->warn("📂 No se encontró la carpeta de imagen_escudo: $rutaImagenEscudo");
            return;
        }

        $imagenes = File::files($rutaImagenEscudo);
        $this->info("🖼️ Se encontraron " . count($imagenes) . " imágenes tipo imagen_escudo.");

        foreach ($imagenes as $archivo) {
            $nombreArchivo = $archivo->getFilename();
            $nombreBase = Str::before($nombreArchivo, '.'); // e.g., Zaragoza Norte
            $nombreNormalizado = $this->normalizarNombre($nombreBase); // e.g., zaragozaNorte

            $entidad = $this->buscarEntidad($nombreNormalizado);

            if (!$entidad) {
                $this->warn("⚠️ No se encontró población para la imagen_escudo: $nombreArchivo");
                continue;
            }

            $url = '/imagenes/poblacion/imagen_escudo/' . $nombreArchivo;

            if ($entidad->imagen_escudo !== $url) {
                $entidad->update(['imagen_escudo' => $url]);
                $this->info("🖼️ Imagen_escudo actualizada para '{$entidad->nombre}'");
            }

            if (!$entidad->fotos()->where('url', $url)->exists()) {
                $entidad->fotos()->create(['url' => $url]);
                $this->info("📷 Imagen_escudo guardada como foto para '{$entidad->nombre}'");
            }
        }
    }

    private function buscarEntidad($nombre)
{
    $nombreNormalizado = $this->normalizarNombre($nombre);

    return Poblacion::all()->first(function ($poblacion) use ($nombreNormalizado) {
        // Comparación case-insensitive para cubrir camelCase ya normalizado en el nombre del archivo
        return strcasecmp($this->normalizarNombre($poblacion->nombre), $nombreNormalizado) === 0;
    });
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
