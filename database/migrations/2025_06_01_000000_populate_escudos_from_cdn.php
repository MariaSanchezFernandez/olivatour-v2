<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    // Filenames (without Escudo prefix and .png extension) as found in public/imagenes/poblacion/escudos/
    private array $escudoFiles = [
        'AlbanchezdeMagina', 'AlcalaLaReal', 'Alcaudete', 'Aldeaquemada', 'Andujar',
        'Arjona', 'Arjonilla', 'ArroyoDelOjanco', 'Baeza', 'Bailen', 'BanosdelaEncina',
        'BeasdeSegura', 'Bedmar', 'Benatae', 'CabradelSantoCristo', 'Canena',
        'Castellar', 'CastillodeLocubin', 'Cazorla', 'ChiclanadeSegura', 'Chilluevar',
        'Frailes', 'FuensantadeMartos', 'FuertedelRey', 'Genave', 'HigueradeCalatrava',
        'Hornos', 'Huelma', 'Iznatoraf', 'Jaen', 'Jamilena', 'Jimena', 'Jodar',
        'LaCarolina', 'LaIruela', 'Linares', 'Lopera', 'ManchaReal', 'Marmolejo',
        'Martos', 'Mengibar', 'NavasdeSanJuan', 'Noalejo', 'Orcera', 'PealdeBecerro',
        'Porcuna', 'PozoAlcon', 'PuentedeGenave', 'Quesada', 'Rus', 'Sabiote',
        'SantaElena', 'SantiagoPontones', 'SantiagodeCalatrava', 'SantistebandelPuerto',
        'SeguradelaSierra', 'Siles', 'SorihueladelGuadalimar', 'Torredelcampo',
        'Torredonjimeno', 'Torreperogil', 'Torres', 'TorresdeAlbanchez', 'Ubeda',
        'ValdepenasdeJaen', 'Vilches', 'Villacarrillo', 'Villadompardo',
        'VillanuevadelArzobispo', 'Villardompardo', 'Villares', 'Villatorres',
        'laGuardiadeJaen', 'laPuertadeSegura', 'losVillares',
    ];

    /** Strip accents and non-alphabetic chars, lowercase — used for matching */
    private function normalizeKey(string $str): string
    {
        $map = [
            'á'=>'a','é'=>'e','í'=>'i','ó'=>'o','ú'=>'u','ü'=>'u','ñ'=>'n',
            'Á'=>'A','É'=>'E','Í'=>'I','Ó'=>'O','Ú'=>'U','Ü'=>'U','Ñ'=>'N',
        ];
        $str = strtr($str, $map);
        $str = preg_replace('/[^a-zA-Z]/', '', $str);
        return strtolower($str);
    }

    public function up(): void
    {
        // Build lookup: normalizedKey => escudo relative URL
        $map = [];
        foreach ($this->escudoFiles as $file) {
            $map[$this->normalizeKey($file)] = '/imagenes/poblacion/escudos/Escudo' . $file . '.png';
        }

        $poblaciones = DB::table('poblaciones')->get(['id', 'nombre']);

        foreach ($poblaciones as $poblacion) {
            $key = $this->normalizeKey($poblacion->nombre);
            if (isset($map[$key])) {
                DB::table('poblaciones')
                    ->where('id', $poblacion->id)
                    ->update(['escudo' => $map[$key]]);
            }
        }
    }

    public function down(): void
    {
        DB::table('poblaciones')->update(['escudo' => null]);
    }
};
