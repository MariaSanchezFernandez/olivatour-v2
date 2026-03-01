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
        Schema::create('poblaciones', function (Blueprint $table) {
            $table->id();
            $table->string('nombre')->unique();
            $table->string('nombreNormalizado')->unique()->nullable();
            $table->text('descripcion1')->nullable();
            $table->text('descripcion2')->nullable();

            $table->decimal('latitud', 10, 7);
            $table->decimal('longitud', 10, 7);
            $table->decimal('viewport_ne_lat', 10, 7)->nullable();
            $table->decimal('viewport_ne_lng', 10, 7)->nullable();
            $table->decimal('viewport_sw_lat', 10, 7)->nullable();
            $table->decimal('viewport_sw_lng', 10, 7)->nullable();

            $table->foreignId('comarca_id')->constrained('comarcas')->onDelete('cascade');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('poblaciones');
    }
};
