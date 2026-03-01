<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Comarca;

class ComarcaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Comarca::factory()->create([
        //     'nombre' => '',
        //     'descripcion' => '',
        // ]);

        Comarca::factory(100)->create();
    }
}