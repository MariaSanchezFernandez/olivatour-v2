<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Logro extends Model
{
    use HasFactory;

    protected $table = 'logros';
    protected $primaryKey = 'id';
    protected $fillable = [
        'titulo',
        'descripcion',
        'icono',
        'tipo',
    ];

    public function logroable()
    {
        return $this->morphTo();
    }
    public function usuarios()
    {
        return $this->belongsToMany(Usuario::class, 'usuarios_logros', 'id_logro', 'id_usuario')
                    ->withPivot('fecha_desbloqueo');
    }
}


