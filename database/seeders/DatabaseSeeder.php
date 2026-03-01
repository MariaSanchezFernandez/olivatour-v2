<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Comarca;
use App\Models\Poblacion;
use App\Models\LugarInteres;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;


class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Evitar duplicados si el contenedor se reinicia
        if (User::count() > 0) {
            return;
        }

        $this->call([
            UserSeeder::class,
            PoblacionesSeeder::class,
            LugarInteresSeeder::class,
        ]);
    }
}
