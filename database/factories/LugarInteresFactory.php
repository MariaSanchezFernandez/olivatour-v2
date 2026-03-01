<?php

namespace Database\Factories;

use App\Models\LugarInteres;
use App\Models\Poblacion;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\LugarInteres>
 */
class LugarInteresFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'nombre' => $this->faker->unique()->name(),
            'nombreNormalizado' => $this->faker->unique()->name(),
            'latitud' => $this->faker->latitude(),
            'longitud' => $this->faker->longitude(),
            'descripcionUno' => $this->faker->sentence(),
            'descripcionDos' => $this->faker->sentence(),
            // 'imagen' => $this->faker->imageUrl(),
            'poblacion_id' => Poblacion::inRandomOrder()->first()->id ?? 1,
        ];
    }
}
