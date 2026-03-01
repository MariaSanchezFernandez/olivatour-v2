<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::factory()->create([
            'name' => 'Jose Manuel',
            'surname' => 'Borras',
            'username' => 'jose',
            'email' => 'jose@olivatour.com',
        ]);

        User::factory()->create([
            'name' => 'María',
            'surname' => 'Sánchez',
            'username' => 'maria',
            'email' => 'maria@olivatour.com',
        ]);

        User::factory()->create([
            'name' => 'Salvador',
            'surname' => 'Izquierdo',
            'username' => 'salvador',
            'email' => 'salvador@olivatour.com',
        ]);

        User::factory()->create([
            'name' => 'Daniel',
            'surname' => 'Moreno',
            'username' => 'daniel',
            'email' => 'daniel@olivatour.com',
        ]);

        User::factory(20)->create();
    }
}
