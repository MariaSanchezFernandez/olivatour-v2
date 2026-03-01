<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
{
    Schema::create('usuarios_logros', function (Blueprint $table) {
        $table->id();
        $table->unsignedBigInteger('id_usuario');
        $table->unsignedBigInteger('id_logro');
        $table->string('tipo')->nullable();
        $table->date('fecha_desbloqueo')->nullable();

        $table->unique(['id_usuario', 'id_logro']);
        $table->foreign('id_usuario')->references('id')->on('users')->onDelete('cascade');
        $table->foreign('id_logro')->references('id')->on('logros')->onDelete('cascade');
        $table->timestamps();
    });
}


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('usuarios_logros');
    }
};
