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
        Schema::table('poblaciones', function (Blueprint $table) {
            $table->string('escudo')->nullable();
            $table->string('imagen_escudo')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('poblaciones', function (Blueprint $table) {
            $table->dropColumn('escudo');
            $table->dropColumn('imagen_escudo');
        });
    }
};
