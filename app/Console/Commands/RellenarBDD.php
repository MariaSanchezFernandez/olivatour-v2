<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class RellenarBDD extends Command
{

    protected $signature = 'db:rellenar';
    protected $description = 'Ejecuta los comandos para rellenar la base de datos';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info("🔄 Rellenando la base de datos...");

        $this->info("🔄 Creando Comarcas ...");
        $this->call('importar:comarcas');

        $this->info("🔄 Creando Poblaciones ...");
        $this->call('importar:poblaciones');

        $this->info("🔄 Creando Lugares de Interés ...");
        $this->call('importar:lugares');

        $this->info("🔄 Asociando Fotos ...");
        $this->call('fotos:asociar-comarcas');
        $this->call('fotos:asociar-poblaciones');
        $this->call('fotos:asociar-lugares');
        
        $this->info("🔄 Creando Logros...");
        $this->call('logros:generar');

        $this->info('✅ Base de datos rellenada correctamente.');	
    }
}
