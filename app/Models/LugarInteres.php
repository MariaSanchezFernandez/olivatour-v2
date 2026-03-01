<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LugarInteres extends Model
{
    use HasFactory;


    protected $table = 'lugares';
    protected $primaryKey = 'id';
    protected $fillable = [
        'nombre',
        'nombreNormalizado',
        'descripcionUno',
        'descripcionDos',
        'tipo',
        'latitud',
        'longitud',
        'viewport_ne_lat',
        'viewport_ne_lng',
        'viewport_sw_lat',
        'viewport_sw_lng',
        'poblacion_id',
    ];

    public function poblacion()
    {
        return $this->belongsTo(Poblacion::class);
    }

    public function fotos()
    {
        return $this->morphMany(Foto::class, 'fotoable');
    }
    
    public function logro()
    {
        return $this->morphOne(Logro::class, 'logroable');
    }

}
