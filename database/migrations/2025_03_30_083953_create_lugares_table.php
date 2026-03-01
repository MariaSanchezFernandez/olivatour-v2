<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('lugares', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->string('nombreNormalizado')->unique();
            $table->text('descripcionUno')->nullable();
            $table->text('descripcionDos')->nullable();
            $table->enum ('tipo', ['calles', 'castillos', 'iglesias', 'monumentos', 'museos','paisajes','yacimientos','otro'])->default('otro');

            $table->decimal('latitud', 10, 7);
            $table->decimal('longitud', 10, 7);
            $table->decimal('viewport_ne_lat', 10, 7)->nullable();
            $table->decimal('viewport_ne_lng', 10, 7)->nullable();
            $table->decimal('viewport_sw_lat', 10, 7)->nullable();
            $table->decimal('viewport_sw_lng', 10, 7)->nullable();
            
            $table->foreignId('poblacion_id')->constrained('poblaciones')->onDelete('cascade');
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lugares');
    }
};
