<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Foto extends Model
{
    protected $table = 'fotos';
    protected $primaryKey = 'id';
    protected $fillable = ['url'];

    public function fotoable()
    {
        return $this->morphTo();  
    }
}

