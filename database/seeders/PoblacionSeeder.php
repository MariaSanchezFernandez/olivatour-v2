<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Poblacion;

class PoblacionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Poblacion::factory()->create([
        //     'nombre' => '',
        //     'descripcionUno' => '',
        //     'latitud' => 1,
        //     'longitud' => 1,
        //     'comarca_id' => 1,
        // ]);

        Poblacion::factory(100)->create();
    }
}