<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Poblacion extends Model
{
    use HasFactory;

    protected $table = 'poblaciones';
    protected $primaryKey = 'id';
    protected $fillable = [
        'nombre',
        'nombreNormalizado',
        'descripcion1',
        'descripcion2',
        'latitud',
        'longitud',
        'viewport_ne_lat',
        'viewport_ne_lng',
        'viewport_sw_lat',
        'viewport_sw_lng',
        'comarca_id',
        'escudo',
        'imagen_escudo'
    ];

    public function comarca()
    {
        return $this->belongsTo(Comarca::class);
    }

    public function lugares()
    {
        return $this->hasMany(LugarInteres::class);
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
