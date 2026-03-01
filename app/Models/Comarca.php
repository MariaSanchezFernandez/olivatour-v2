<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Comarca extends Model
{
    use HasFactory;

    protected $table = 'comarcas';
    protected $primaryKey = 'id';
    protected $fillable = [
        'nombre',
        'nombreNormalizado',
        'latitud',
        'longitud',
    ];
    
    public function poblaciones()
    {
        return $this->hasMany(Poblacion::class);
    }
    public function fotos()
    {
        return $this->morphMany(Foto::class, 'fotoable');
    }

    public function logros()
    {
        return $this->morphMany(Logro::class, 'logroable');
    }
}
