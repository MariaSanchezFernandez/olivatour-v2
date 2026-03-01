<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Logro>
 */
class LogroFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'titulo' => $this->faker->title(),
            'descripcion' => $this->faker->sentence(),
            'tipo' => $this->faker->randomElement(['comarca', 'poblacion', 'lugar']),
            'logroable_id' => $this->faker->numberBetween(1, 100),
            'logroable_type' => $this->faker->randomElement(['Comarca', 'Poblacion', 'Lugar']),
        ];
    }
}