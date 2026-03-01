<?php

namespace Database\Factories;

use \App\Models\Poblacion;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Poblacion>
 */
class PoblacionFactory extends Factory
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
            'descripcion1' => $this->faker->sentence(),
            'descripcion2' => $this->faker->sentence(),
            // 'imagen' => $this->faker->imageUrl(),
            'comarca_id' => $this->faker->numberBetween(1, 99),
            // 'comarca_id' => Comarca::factory()->create()->id,
        ];
    }
}