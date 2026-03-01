<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use \App\Models\Comarca;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Comarca>
 */
class ComarcaFactory extends Factory
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
            // 'descripcion' => $this->faker->unique()->text(),
            // 'logro_id' => Comarca::inRandomOrder()->first()->id ?? 1,
        ];
    }
}
