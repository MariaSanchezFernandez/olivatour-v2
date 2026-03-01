<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * 
     * 
     * creo que mejor que el idioma sea integer
     * 
     * 0 = español
     * 1 = ingles
     * 2 = francés
     * 3 = alemán
     * 4 = italiano
     * 5 = portugués
     * 6 = chino
     * 7 = japonés
     * 8 = ruso
     * 9 = arabe
     * 10 = otros
     */
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id()->unique();
            $table->string('username')->unique()->nullable(); // si no están nullables da fallo al registrarse con una cuenta nueva
            $table->string('name', 50);
            $table->string('surname', 50)->nullable();
            $table->string('email')->unique();
            $table->string('password');
            $table->date('edad')->nullable()->nullable();
            $table->integer('idioma')->nullable();
            $table->rememberToken(); // recorar contraseña
            $table->timestamp('email_verified_at')->nullable();
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
