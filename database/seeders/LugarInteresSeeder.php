<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use App\Models\Poblacion;
use App\Models\LugarInteres;

class LugarInteresSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Leemos el JSON completo
        $json = File::get(database_path('seeders/data/jsonLugaresInteres.json'));
        $raw  = json_decode($json, true);

        // 2. Mapeo de tipos Google a enum de la tabla
        $tipoMap = [
            'tourist_attraction'   => 'paisajes',
            'church'               => 'iglesias',
            'castle'               => 'castillos',
            'museum'               => 'museos',
            'archaeological_site'  => 'yacimientos',
            'street_address'       => 'calles',
            'point_of_interest'    => 'paisajes',
        ];
        $allowed = ['calles', 'castillos', 'iglesias', 'museos', 'paisajes', 'yacimientos', 'otro'];

        foreach ($raw as $group) {
            foreach ($group as $data) {
                $nombre    = $data['nombre'] ?? null;
                if (! $nombre) continue;

                $slug      = Str::slug($nombre, '-');
                $direccion = $data['direccion'] ?? '';

                // 3. Extraer nombre de la población
                $parts     = explode(',', $direccion);
                $pobPart   = trim($parts[count($parts) - 3] ?? '');
                $pobNombre = preg_replace('/^\d+\s*/', '', $pobPart);
                $poblacion = Poblacion::firstWhere('nombre', $pobNombre);
                if (! $poblacion) continue;

                // 4. Mapear tipo al enum válido
                $rawTipo = $data['tipos'][0] ?? null;
                $tipo    = $tipoMap[$rawTipo] ?? 'otro';
                if (! in_array($tipo, $allowed, true)) {
                    $tipo = 'otro';
                }

                // 5. Crear o actualizar LugarInteres usando 'nombre' como criterio único
                $lugar = LugarInteres::updateOrCreate(
                    ['nombre' => $nombre],  // coincide con índice unique en DB
                    [
                        'poblacion_id'      => $poblacion->id,
                        'nombreNormalizado' => $slug,
                        'descripcionUno'       => $direccion,
                        'tipo'              => $tipo,
                        'latitud'           => $data['coordenadas']['lat'] ?? null,
                        'longitud'          => $data['coordenadas']['lng'] ?? null,
                        'viewport_ne_lat'   => $data['coordenadas']['lat'] ?? null,
                        'viewport_ne_lng'   => $data['coordenadas']['lng'] ?? null,
                        'viewport_sw_lat'   => $data['coordenadas']['lat'] ?? null,
                        'viewport_sw_lng'   => $data['coordenadas']['lng'] ?? null,
                    ]
                );

                // 6. Insertar fotos polimórficas
                foreach ($data['imagenes'] ?? [] as $img) {
                    $lugar->fotos()->updateOrCreate(
                        ['url' => $img['archivo']],
                        ['url' => $img['archivo']]
                    );
                }
            }
        }


        LugarInteres::factory()->create([
            'nombre' => 'Fuensanta de Martos',
            'descripcionUno' => 'Fuensanta de Martos es un pequeño municipio de origen medieval, mencionado ya en el siglo XIII tras la conquista cristiana. Su estructura urbana responde al trazado típico andalusí adaptado posteriormente al modelo castellano, con calles estrechas y un entorno agrícola dominado por el olivar.',
            'descripcionDos' => 'El entorno natural y su ritmo de vida tranquilo lo convierten en un destino ideal para el turismo rural. Las festividades en honor a la Virgen de la Fuensanta, en septiembre, son el mejor momento para conocer sus costumbres y su hospitalidad.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Iglesia Parroquial de Nuestra Señora de la Fuensanta',
            'descripcionUno' => 'Construida en el siglo XVIII sobre un templo anterior, esta iglesia combina elementos barrocos con una disposición sobria propia de la arquitectura rural andaluza. Su torre-campanario es uno de los elementos más reconocibles del perfil del pueblo.',
            'descripcionDos' => 'En su interior se conserva la imagen de la Virgen de la Fuensanta, patrona del municipio, muy venerada por los vecinos. Es el centro de las celebraciones religiosas y destaca por su ambiente sereno y su valor simbólico para los habitantes.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Fuente de la Negra',
            'descripcionUno' => 'Situada a las afueras del casco urbano, esta fuente tradicional ha sido durante siglos un punto clave de abastecimiento de agua. Su nombre proviene de una leyenda local vinculada a una figura femenina, transmitida oralmente entre generaciones.',
            'descripcionDos' => 'Aunque modesta en estructura, es un lugar popular para el paseo y el descanso, rodeado de vegetación. Ofrece una visión auténtica del uso del agua en la cultura rural de Jaén y conecta con el legado etnográfico de la zona.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Torre del Algarrobo',
            'descripcionUno' => 'Esta torre de origen islámico, datada entre los siglos XI y XIII, formaba parte del sistema de vigilancia de la campiña. Su función era controlar los caminos entre Martos, Fuensanta y Higuera, avisando con señales visuales.',
            'descripcionDos' => 'Actualmente se conservan restos visibles en una zona de difícil acceso, pero muy apreciada por senderistas e historiadores. Su valor radica en su papel como testigo del pasado defensivo del valle del Guadalquivir.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Paseo del Despeñadero',
            'descripcionUno' => 'Este mirador natural ofrece una de las vistas más espectaculares del entorno de Fuensanta. Desde aquí se domina el valle del río Víboras y parte del macizo de Sierra Sur de Jaén, con atardeceres inolvidables.',
            'descripcionDos' => 'Es un paseo frecuentado por vecinos y visitantes, ideal para hacer fotos o descansar bajo la sombra de los pinos. La barandilla de hierro forjado y los bancos invitan a detenerse y contemplar la inmensidad del paisaje olivarero.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Fuerte del Rey',
            'descripcionUno' => 'Fundado como aldea fortificada en el siglo XIV por orden de la corona, Fuerte del Rey surgió con fines defensivos tras la conquista de Jaén. Su trazado original incluía una torre y recinto amurallado hoy desaparecidos.',
            'descripcionDos' => 'Actualmente es un pueblo agrícola tranquilo, ideal para conocer el Jaén rural. Su nombre y disposición remiten claramente a su pasado militar, y conserva tradiciones locales muy ligadas al cultivo del olivar.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Iglesia de la Natividad de Nuestra Señora (Fuerte del Rey)',
            'descripcionUno' => 'Levantada en el siglo XVII, esta iglesia mezcla estilo renacentista con detalles barrocos. La fachada es sobria, pero el interior alberga retablos y elementos ornamentales de gran belleza y tradición.',
            'descripcionDos' => 'El templo es el centro de la vida religiosa del municipio y alberga las principales festividades locales. Su arquitectura refleja la transición entre lo clásico y lo ornamental en las iglesias rurales jiennenses.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Molino del primer tercio del siglo XX',
            'descripcionUno' => 'Este molino harinero u oleícola, hoy en desuso, representa la tecnología rural de comienzos del siglo XX en Jaén. Conserva parte de la maquinaria original y el edificio responde a un diseño funcional con muros de piedra y cubierta a dos aguas.',
            'descripcionDos' => 'Es un vestigio industrial que conecta con la historia del trabajo en el campo. Algunos proyectos locales han intentado su rehabilitación como centro de interpretación del aceite, lo que potenciaría el turismo cultural.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Higuera de Calatrava',
            'descripcionUno' => 'Este pequeño municipio tiene un origen medieval ligado a la Orden de Calatrava, de la que tomó su nombre. Su castillo fue parte de la red de defensa fronteriza entre cristianos y musulmanes en la Baja Edad Media.',
            'descripcionDos' => 'Hoy en día, es un pueblo apacible y rural, rodeado de olivares y con vistas espectaculares. Las fiestas locales, como las patronales de agosto, mantienen viva la identidad histórica y religiosa del lugar.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Castillo de Higuera de Calatrava',
            'descripcionUno' => 'Construido entre los siglos XIII y XIV, este castillo fue cedido por la corona a la Orden de Calatrava. Su estructura original incluía una torre del homenaje y un recinto amurallado adaptado al terreno.',
            'descripcionDos' => 'Actualmente se conserva parte del muro perimetral y la base de la torre. Es un lugar frecuentado por senderistas y curioso por su posición estratégica sobre un cerro, ideal para entender la defensa del valle.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Iglesia Parroquial de la Inmaculada Concepción',
            'descripcionUno' => 'Este templo de estilo neoclásico fue edificado a finales del siglo XVIII, con una única nave y una fachada simple coronada por una espadaña. Se trata de una iglesia funcional, adaptada a las dimensiones del pueblo.',
            'descripcionDos' => 'En su interior se guarda la imagen de la patrona y diversas tallas de interés devocional. Es visitable durante actos litúrgicos, y destaca por la serenidad de su entorno y su valor patrimonial para la comunidad.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Pozo de la Orden',
            'descripcionUno' => 'Este pozo histórico se vincula a la época en que el municipio dependía de la Orden de Calatrava. Su estructura de piedra y brocal tradicional se ha mantenido como símbolo de la importancia del agua en la historia local.',
            'descripcionDos' => 'Actualmente se conserva como elemento patrimonial y es parte de la ruta local de fuentes y aljibes. Algunos vecinos recuerdan que fue usado hasta mediados del siglo XX, lo que lo convierte en un testimonio vivo del pasado cotidiano.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Jaén',
            'descripcionUno' => 'Jaén, capital de la provincia homónima, tiene un pasado que se remonta a íberos, romanos y árabes. Su estratégica situación le otorgó gran importancia militar y política, y hoy conserva un casco antiguo con influencias medievales, renacentistas y barrocas.',
            'descripcionDos' => 'Es una ciudad ideal para explorar a pie, con miradores, callejones históricos y una gastronomía marcada por el aceite de oliva virgen extra. Jaén es punto de partida perfecto para visitar el resto de la provincia y disfrutar de su riqueza cultural y natural.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Catedral de la Asunción',
            'descripcionUno' => 'Construida entre los siglos XVI y XVIII, la catedral de Jaén es una joya del Renacimiento español, diseñada por Andrés de Vandelvira. Su fachada barroca contrasta con un interior armonioso de enormes columnas y bóvedas.',
            'descripcionDos' => 'Fue modelo para muchas catedrales de Hispanoamérica. Destaca su relicario con el Santo Rostro y las vistas desde su torre. Se puede visitar todo el año con guía o por libre, y es uno de los imprescindibles de la ciudad.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Castillo de Santa Catalina',
            'descripcionUno' => 'Este castillo, de origen islámico y reformado por los cristianos en el siglo XIII, domina la ciudad desde un cerro. Formaba parte del sistema defensivo del reino de Jaén y conserva torres, murallas y aljibes.',
            'descripcionDos' => 'Se puede visitar y ofrece espectaculares vistas del valle y del mar de olivos. En su interior hay un centro de interpretación, y junto a él se alza el Parador Nacional. Ideal para la puesta de sol o rutas de senderismo.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Baños Árabes y Palacio de Villardompardo',
            'descripcionUno' => 'Los Baños Árabes de Jaén son los más grandes conservados de Europa. Datados en el siglo XI, se encuentran bajo el palacio renacentista de Villardompardo, actual sede de varios museos municipales.',
            'descripcionDos' => 'La entrada es gratuita y permite visitar las salas del baño (fría, templada y caliente) y colecciones de arte e historia. Es un lugar fascinante para entender el legado andalusí y renacentista en un mismo espacio.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Basílica Menor de San Ildefonso',
            'descripcionUno' => 'Construida entre los siglos XIV y XVIII, esta iglesia mezcla estilos gótico, renacentista y barroco. Es uno de los templos más queridos de Jaén, ya que alberga la imagen de la Virgen de la Capilla, patrona de la ciudad.',
            'descripcionDos' => 'Cuenta con tres portadas, siendo la neogótica la más reconocible. El interior es amplio y solemne, con un retablo mayor de gran riqueza. Está abierta al público y forma parte esencial de las procesiones locales.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Mirador de la Cruz',
            'descripcionUno' => 'Situado junto al Castillo de Santa Catalina, el Mirador de la Cruz ofrece las mejores vistas panorámicas de Jaén y su entorno. El nombre proviene de la gran cruz blanca instalada en la roca durante el siglo XX.',
            'descripcionDos' => 'Es accesible en coche o andando, y permite ver desde Sierra Mágina hasta la campiña. Muy popular al atardecer, es un sitio perfecto para fotos y contemplación, con bancos y pasarelas seguras.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Iglesia de San Juan',
            'descripcionUno' => 'Este templo, de origen medieval, fue reconstruido en estilo gótico y posteriormente reformado. Se sitúa en el barrio homónimo, uno de los más antiguos de Jaén, junto a la antigua cárcel real y la fuente de la Magdalena.',
            'descripcionDos' => 'Su torre servía también de vigilancia urbana. Aunque su interior es sobrio, guarda retablos y tallas de valor. Abre en días de culto y procesiones, siendo parte esencial del patrimonio religioso local.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Jamilena',
            'descripcionUno' => 'Jamilena es un municipio situado al pie de la Sierra de la Grana, con orígenes íberos y fuerte presencia islámica. Su urbanismo escalonado responde a su topografía montañosa, y ofrece interesantes vistas y rutas naturales.',
            'descripcionDos' => 'El pueblo conserva una identidad rural muy viva, y es ideal para el senderismo o conocer fiestas tradicionales como la romería de San Isidro. Sus calles estrechas y empinadas conservan el sabor auténtico de la campiña jiennense.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Iglesia Parroquial de Nuestra Señora de la Natividad',
            'descripcionUno' => 'Construida en el siglo XVI y reformada en los siglos XVIII y XX, esta iglesia presenta una fachada sencilla y una nave con bóveda de cañón. El estilo es popular andaluz con influencias neoclásicas.',
            'descripcionDos' => 'En su interior destaca la imagen de la Virgen de la Natividad, patrona del municipio. Es el centro de las fiestas mayores en septiembre, y un punto de encuentro espiritual para los vecinos.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Ermita de San Francisco',
            'descripcionUno' => 'La Ermita de San Francisco está situada en las afueras del casco urbano, probablemente construida en el siglo XVIII. Es un edificio de pequeña planta rectangular, con una espadaña y cubierta a dos aguas.',
            'descripcionDos' => 'Acoge las celebraciones de su titular, con romerías y misas populares. Rodeada de olivos, su entorno es ideal para pequeñas rutas y actividades en familia, especialmente en primavera.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Baños de la Salvadora',
            'descripcionUno' => 'Estos baños termales, ya mencionados en documentos del siglo XIX, se encuentran en ruinas, pero siguen siendo conocidos por las propiedades de sus aguas sulfurosas. Eran usados con fines medicinales.',
            'descripcionDos' => 'Situados en el paraje de Fuente de la Salvadora, se llega a ellos por sendero. Aunque no son visitables como balneario, son lugar habitual de rutas de senderismo y turismo rural. Algunos lugareños aún usan el manantial para baños puntuales.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'La Guardia de Jaén',
            'descripcionUno' => 'La Guardia es un municipio con restos iberos, romanos y medievales. Su posición estratégica cerca de la capital la convirtió en plaza fuerte desde la antigüedad, conservando un rico patrimonio defensivo y religioso.',
            'descripcionDos' => 'Hoy combina turismo rural y cultural con vistas espectaculares del valle. Su entorno montañoso y olivares lo hacen ideal para rutas senderistas. Las fiestas de septiembre y Semana Santa atraen a visitantes cada año.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Castillo de La Guardia',
            'descripcionUno' => 'De origen árabe y reformado tras la conquista cristiana, data del siglo XIII. Su estilo es militar, con torreones rectangulares y restos de murallas. Fue punto clave en la frontera del reino de Jaén.',
            'descripcionDos' => 'Aunque en ruinas, es accesible a pie y permite contemplar el trazado defensivo. Las vistas desde la torre son extraordinarias. Paneles informativos lo integran en rutas de castillos de la provincia.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Iglesia de Nuestra Señora de la Asunción',
            'descripcionUno' => 'Templo del siglo XVI con reformas posteriores, combina gótico tardío y renacentista. Su portada plateresca es uno de sus elementos más valiosos, y en el interior destaca su retablo mayor barroco.',
            'descripcionDos' => 'Es el centro espiritual del municipio. Acoge conciertos, misas y celebraciones patronales. Su campanario, visible desde casi todo el pueblo, es símbolo de identidad local.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Plaza Isabel II',
            'descripcionUno' => 'Centro neurálgico del casco urbano, es una plaza porticada de trazado clásico. Ha sido lugar de mercado, reunión y festejos desde el siglo XIX. Está presidida por una fuente y el Ayuntamiento.',
            'descripcionDos' => 'Es punto de partida ideal para recorrer el municipio. Cuenta con bancos, sombra y acceso a bares y comercios. Se convierte en escenario central en fiestas y celebraciones públicas.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Cerro de San Cristóbal',
            'descripcionUno' => 'Mirador natural con restos arqueológicos, se sitúa sobre el núcleo urbano. Alberga vestigios iberos, romanos y medievales. Se accede por una ruta sencilla desde el pueblo.',
            'descripcionDos' => 'Desde la cima se divisa la campiña jiennense y parte de Sierra Mágina. Ideal para caminatas y fotos al atardecer. En primavera se cubre de flores silvestres, siendo un rincón popular entre los locales.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Los Villares',
            'descripcionUno' => 'Municipio de origen medieval, muy vinculado al desarrollo agrario. Su nombre proviene de antiguas aldeas unificadas. Ha conservado su estructura tradicional y estilo de vida rural.',
            'descripcionDos' => 'Ideal para escapadas cortas y senderismo, gracias al cercano parque periurbano. Celebra fiestas tradicionales como la romería de San Isidro o la Feria de Agosto, muy animada.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Iglesia de San Juan Bautista',
            'descripcionUno' => 'Templo barroco del siglo XVIII, con fachada sencilla y espadaña sobre la portada. Su interior es sobrio, con una única nave y altar mayor clásico.',
            'descripcionDos' => 'Es la iglesia parroquial del pueblo y centro de sus fiestas patronales. Suele estar abierta para visitas religiosas y culturales. Guarda tallas populares de gran devoción local.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Parque Periurbano de Los Villares',
            'descripcionUno' => 'Espacio natural protegido con pinares y áreas recreativas, ideal para picnic, ciclismo o senderismo. Se encuentra a pocos minutos del centro urbano, con accesos señalizados.',
            'descripcionDos' => 'Tiene rutas adaptadas, zonas con mesas, barbacoas y merenderos. Muy frecuentado los fines de semana. Perfecto para pasar un día en la naturaleza sin alejarse de Jaén capital.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Palacio del Vizconde',
            'descripcionUno' => 'Edificio señorial del siglo XIX, de estilo historicista, con fachada de sillería y balcones de forja. Fue residencia de notables locales y conserva parte de su estructura original.',
            'descripcionDos' => 'Actualmente alberga actividades culturales y eventos municipales. No siempre está abierto al público, pero es visible desde el exterior y se encuentra en una céntrica plaza.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Mancha Real',
            'descripcionUno' => 'Pueblo de fundación moderna, nacido en 1537 tras la repoblación ordenada por Carlos V. Su trazado urbano responde al modelo de cuadrícula castellana.',
            'descripcionDos' => 'Actualmente es un centro económico dinámico, con fuerte industria del mueble. Cuenta con edificios religiosos de interés y rutas naturales en su entorno.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Antiguo Convento de los Carmelitas Descalzos',
            'descripcionUno' => 'Fundado en el siglo XVII, de estilo barroco sobrio, funcionó como convento hasta el siglo XIX. Su fachada aún conserva los escudos de la orden.',
            'descripcionDos' => 'Hoy es sede de actividades culturales y sociales. Su claustro puede visitarse durante eventos o exposiciones. Es uno de los edificios históricos mejor conservados del municipio.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Torre del Risquillo',
            'descripcionUno' => 'Pequeña torre defensiva medieval, situada en una loma cercana al pueblo. Data del siglo XIII y está hecha en mampostería y tapial.',
            'descripcionDos' => 'Es accesible a pie por un sendero corto. Desde ella se obtienen buenas vistas de la campiña. Es parte de la red de torres vigía de la zona.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Iglesia Parroquial de San Juan Evangelista',
            'descripcionUno' => 'Construida en el siglo XVI y reformada en los siglos posteriores. Tiene una sola nave con artesonado de madera y una torre-campanario de ladrillo visto.',
            'descripcionDos' => 'Es el templo principal de Mancha Real. Alberga imágenes procesionales y eventos religiosos durante todo el año. Es visitable y de acceso libre en horario litúrgico.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Mirador de la Puerta de Jaén',
            'descripcionUno' => 'Situado en la entrada este del municipio, ofrece vistas amplias del entorno natural. Está acondicionado con barandilla, bancos y paneles informativos.',
            'descripcionDos' => 'Es un lugar tranquilo para contemplar el atardecer. También sirve como punto de partida para rutas senderistas hacia Sierra Mágina.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Martos',
            'descripcionUno' => 'Martos, cuna del olivar andaluz, tiene raíces íberas y romanas. Fue una plaza fuerte musulmana y luego encomienda de la Orden de Calatrava. Su casco antiguo conserva callejones empinados y monumentos históricos.',
            'descripcionDos' => 'Conocida como la "Perla de Sierra Sur", es un excelente destino cultural y gastronómico. Celebra San Amador, su patrón, con gran fervor en mayo, y destaca por su entorno natural y vistas panorámicas.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Castillo de la Villa',
            'descripcionUno' => 'De origen islámico y reformado en época cristiana, el castillo corona la ciudad desde lo alto del cerro. Su estructura militar incluye torres y murallas del siglo XIII.',
            'descripcionDos' => 'Es visitable y forma parte del paisaje emblemático de Martos. Desde su torre se obtienen vistas impresionantes del mar de olivos. Ideal para quienes disfrutan de historia y fotografía.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Real Iglesia de Santa Marta',
            'descripcionUno' => 'Templo gótico-renacentista construido entre los siglos XV y XVI. Su portada plateresca y retablo mayor barroco son auténticas joyas del arte religioso.',
            'descripcionDos' => 'Es la iglesia principal del municipio y lugar de descanso de Santa Marta, su patrona. Se puede visitar y es especialmente impresionante durante las procesiones.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Parroquia de San Francisco de Asís',
            'descripcionUno' => 'Iglesia barroca del siglo XVIII, con fachada sencilla y una única nave. Pertenece a un antiguo convento franciscano hoy desaparecido.',
            'descripcionDos' => 'Acoge celebraciones y misas diarias. Es visitada por su recogimiento, y alberga imágenes de gran devoción popular en Martos.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Parque Municipal Manuel Carrasco',
            'descripcionUno' => 'Parque urbano de principios del siglo XX, con jardines, fuentes y caminos arbolados. Está dedicado a un maestro local y es pulmón verde de la ciudad.',
            'descripcionDos' => 'Perfecto para pasear o descansar en familia. Acoge actividades culturales y deportivas. Muy concurrido en primavera y verano.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Iglesia de San Amador y Santa Ana',
            'descripcionUno' => 'Templo de estilo neoclásico, construido en el siglo XIX. Su interior es sobrio, con altar mayor presidido por San Amador, patrón de Martos.',
            'descripcionDos' => 'Es sede de la popular romería de mayo. Punto de encuentro espiritual y cultural para los marteños, especialmente en las festividades.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Ermita de San Bartolomé',
            'descripcionUno' => 'Situada en una colina, esta ermita del siglo XVII ofrece excelentes vistas. Su arquitectura es sencilla, con espadaña y portada barroca.',
            'descripcionDos' => 'Es escenario de celebraciones populares. Lugar tranquilo, rodeado de naturaleza, ideal para caminatas cortas desde el casco urbano.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Mengíbar',
            'descripcionUno' => 'Mengíbar es un cruce de caminos con pasado íbero y romano. En su término tuvo lugar la célebre Batalla de Bailén (1808). Hoy combina vida agrícola e industrial.',
            'descripcionDos' => 'Cuenta con monumentos, tradición oleícola y un rico calendario festivo. Es una parada interesante en la ruta hacia Bailén o Linares.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Torre del Homenaje',
            'descripcionUno' => 'Torre medieval del siglo XIII, única estructura que se conserva del antiguo castillo. De planta cuadrada, construida en mampostería.',
            'descripcionDos' => 'Es visitable exteriormente y forma parte del centro histórico. Muy fotogénica, especialmente iluminada por la noche.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Casa Palacio',
            'descripcionUno' => 'Edificio nobiliario del siglo XVIII con fachada barroca. Fue residencia de importantes familias locales. Tiene balcones de forja y escudo heráldico.',
            'descripcionDos' => 'Actualmente alberga dependencias municipales. Se encuentra en la plaza central y es visible en cualquier visita al casco antiguo.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Iglesia de San Pedro Apóstol',
            'descripcionUno' => 'Construida en el siglo XVI, mezcla estilos gótico, renacentista y barroco. Su torre destaca en el perfil urbano. El interior alberga un retablo mayor de gran valor.',
            'descripcionDos' => 'Es la parroquia principal y se puede visitar en horario religioso. Celebra importantes actos litúrgicos y festividades locales.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Parroquia de la Inmaculada Concepción',
            'descripcionUno' => 'Templo más moderno, edificado en el siglo XX para ampliar servicios religiosos. De estilo funcional, con líneas limpias y decoración austera.',
            'descripcionDos' => 'Se encuentra en una zona de expansión del municipio. Acoge muchas celebraciones populares y actividades juveniles.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Museo Activo Terra Oleum',
            'descripcionUno' => 'Centro de interpretación del aceite de oliva y del olivar andaluz. Está equipado con tecnología interactiva y espacios expositivos modernos.',
            'descripcionDos' => 'Ubicado en el Parque Científico-Tecnológico Geolit. Ideal para visitas educativas y familiares. Se puede degustar AOVE y conocer su proceso.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Santiago de Calatrava',
            'descripcionUno' => 'Pueblo de origen medieval vinculado a la Orden de Calatrava. De estructura urbana compacta, rodeado de olivares y campos cerealistas.',
            'descripcionDos' => 'Lugar tranquilo, con gran sentido de comunidad. Celebra fiestas patronales en honor a la Virgen de la Estrella con actividades culturales.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Parroquia de la Virgen de la Estrella',
            'descripcionUno' => 'Iglesia neoclásica del siglo XVIII. Su interior es luminoso y alberga la imagen de la patrona, muy venerada en el pueblo.',
            'descripcionDos' => 'Centro de la vida espiritual. Es el lugar clave durante las fiestas de agosto y Semana Santa. Abre habitualmente para actos religiosos.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Cámara Agraria',
            'descripcionUno' => 'Edificio de arquitectura funcional construido en el siglo XX. Sede de cooperativas y asociaciones agrícolas locales.',
            'descripcionDos' => 'No es visitable como monumento, pero forma parte del paisaje urbano vinculado al olivar. Se usa para asambleas y cursos técnicos.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Plaza de la Iglesia',
            'descripcionUno' => 'Plaza principal del pueblo, con bancos, árboles y fuente. Punto de encuentro social y escenario de ferias y fiestas patronales.',
            'descripcionDos' => 'Desde aquí se contemplan la iglesia y las calles tradicionales del casco antiguo. Buen lugar para comenzar una visita a pie.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Torredelcampo',
            'descripcionUno' => 'Pueblo con fuerte identidad agrícola. Su origen está ligado al proceso repoblador tras la conquista cristiana. Conserva patrimonio defensivo y religioso.',
            'descripcionDos' => 'Celebra fiestas como San Antón y la feria de agosto. Cuenta con zonas verdes y una animada vida local.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Iglesia Parroquial de San Bartolomé',
            'descripcionUno' => 'Templo del siglo XVI, reformado en estilo barroco. Destaca su retablo mayor y las imágenes procesionales que alberga.',
            'descripcionDos' => 'Centro espiritual de Torredelcampo. Muy activa en Semana Santa y Corpus Christi. Visitable en horario religioso.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Cerro Miguelico',
            'descripcionUno' => 'Yacimiento arqueológico con restos iberos, romanos y visigodos. Situado en las afueras del municipio, accesible a pie o en coche.',
            'descripcionDos' => 'Lugar interesante para conocer el pasado antiguo de la zona. Desde la cima se divisan olivares y montañas.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Castillo del Berrueco',
            'descripcionUno' => 'Fortaleza medieval en ruinas, de origen árabe. Controlaba la ruta entre Martos y Jaén. Restos de torres y murallas aún visibles.',
            'descripcionDos' => 'Accesible por ruta de senderismo. Punto ideal para excursiones y fotografía de paisaje.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Torredonjimeno',
            'descripcionUno' => 'Municipio con historia medieval y renacentista. Conserva palacios, iglesias y un castillo reformado. Centro oleícola y comercial.',
            'descripcionDos' => 'Muy activo culturalmente, con museos, certámenes y fiestas populares durante todo el año.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Museo del Aceite y Olivar',
            'descripcionUno' => 'Espacio cultural que explica el proceso del aceite y la historia del olivar. Ubicado en un antiguo molino reformado.',
            'descripcionDos' => 'Cuenta con maquetas, audiovisuales y degustaciones. Ideal para visitas en grupo o escolares.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Castillo de Torredonjimeno',
            'descripcionUno' => 'Fortaleza del siglo XIII, reformada como palacio en el XVI. Se conserva parte de su muralla y patio interior.',
            'descripcionDos' => 'Visitable en horarios definidos. Alberga eventos culturales y exposiciones temporales.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Iglesia de Santa María',
            'descripcionUno' => 'Templo barroco del siglo XVII con fachada de sillería y torre-campanario. Su interior destaca por sus retablos y cúpula central.',
            'descripcionDos' => 'Es sede de cofradías y actos religiosos importantes. Muy activa en Semana Santa.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Iglesia de San Pedro',
            'descripcionUno' => 'Iglesia sencilla de estilo neoclásico, construida en el siglo XIX. Con nave única y altar mayor con imagen del titular.',
            'descripcionDos' => 'Abierta para cultos y celebraciones populares. Participa activamente en el calendario litúrgico local.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Villardompardo',
            'descripcionUno' => 'Pequeño municipio con origen árabe y tradición agrícola. Su casco urbano se organiza en torno al castillo y la iglesia.',
            'descripcionDos' => 'Conserva costumbres tradicionales y una vida tranquila. Ideal para turismo rural.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Castillo de Villardompardo',
            'descripcionUno' => 'Fortificación de origen musulmán, reformada por los cristianos en el siglo XIII. De planta rectangular, con torre del homenaje.',
            'descripcionDos' => 'En buen estado de conservación. Accesible para visitas. Punto clave en la defensa de la campiña.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Iglesia de Nuestra Señora de Gracia',
            'descripcionUno' => 'Templo barroco del siglo XVIII, con campanario y planta rectangular. Guarda imágenes de gran devoción local.',
            'descripcionDos' => 'Es el corazón de la vida religiosa del pueblo. Visitable durante celebraciones litúrgicas.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Paraje del Calvario',
            'descripcionUno' => 'Espacio natural en las afueras del pueblo, con mirador, cruz y zona de descanso. Punto final del Vía Crucis local.',
            'descripcionDos' => 'Ideal para paseos cortos y contemplar el paisaje de olivares. Muy visitado en Semana Santa.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Villatorres',
            'descripcionUno' => 'Municipio formado por la unión de varias aldeas históricas. En su término se halla la antigua ciudad íbero-romana de Iliturgi.',
            'descripcionDos' => 'Es un municipio agrícola, con tradiciones bien conservadas y buenas rutas rurales.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Ciudad Íbero-Romana de Iliturgi',
            'descripcionUno' => 'Importante yacimiento arqueológico situado cerca del río Guadalquivir. Tuvo gran relevancia en la antigüedad por su localización estratégica.',
            'descripcionDos' => 'Restos de muralla, cerámica y necrópolis pueden observarse. Accesible desde la carretera, con paneles explicativos.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Ermita del Santo Cristo de la Salud',
            'descripcionUno' => 'Construcción del siglo XVIII, de estilo rural andaluz. Muy querida por los vecinos, es centro de devoción y romerías.',
            'descripcionDos' => 'Situada en un entorno natural tranquilo. Se visita especialmente en septiembre, durante las fiestas locales.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Iglesia de Nuestra Señora de la Asunción',
            'descripcionUno' => 'Templo parroquial del siglo XVI con elementos renacentistas y barrocos. De planta de cruz latina y torre-campanario de sillería.',
            'descripcionDos' => 'Abierta al público en horario litúrgico. Punto neurálgico de la comunidad y sede de las principales celebraciones religiosas.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Úbeda',
            'descripcionUno' => 'Ciudad renacentista por excelencia, declarada Patrimonio de la Humanidad en 2003 junto a Baeza. Su esplendor comenzó en el siglo XVI con figuras como Francisco de los Cobos, secretario de Carlos V.',
            'descripcionDos' => 'Pasear por Úbeda es recorrer un museo al aire libre: palacios, iglesias y plazas perfectamente conservadas. Ideal para los amantes del arte, la historia y la gastronomía local basada en el aceite de oliva virgen extra.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'El Salvador (Sacra Capilla del Salvador del Mundo)',
            'descripcionUno' => 'Construida entre 1536 y 1559 por Diego de Siloé y Andrés de Vandelvira, es una de las joyas del Renacimiento español. Encargada por Francisco de los Cobos como panteón familiar.',
            'descripcionDos' => 'Destaca por su fachada plateresca, su portada escultórica y la impresionante cúpula interior. Visitable todos los días, es parada obligatoria en cualquier ruta por Úbeda.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Santa María de los Reales Alcázares',
            'descripcionUno' => 'Erigida sobre una antigua mezquita, la iglesia muestra elementos góticos, renacentistas y barrocos. Fue colegiata y sede de cabildo, símbolo del poder eclesiástico local.',
            'descripcionDos' => 'Su retablo mayor y las capillas laterales son de gran valor artístico. Está situada en la Plaza Vázquez de Molina y suele estar abierta a visitas turísticas y actos religiosos.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Ayuntamiento de Úbeda (Palacio de las Cadenas)',
            'descripcionUno' => 'Diseñado por Andrés de Vandelvira en el siglo XVI, es un ejemplo de arquitectura renacentista civil. Su nombre viene de las cadenas que delimitaban la zona de inmunidad eclesiástica.',
            'descripcionDos' => 'Hoy funciona como sede del Ayuntamiento. Su patio interior y su fachada con balcones enrejados pueden visitarse en horario administrativo o durante eventos culturales.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Miradores del Alcázar',
            'descripcionUno' => 'Situados en el borde del casco histórico, donde antiguamente estuvo el alcázar árabe. Aunque este desapareció, el lugar ofrece espectaculares vistas al valle del Guadalquivir.',
            'descripcionDos' => 'Perfecto para disfrutar de la puesta de sol o hacer fotos panorámicas. Es uno de los rincones más tranquilos y apreciados por los locales y visitantes.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Iglesia de San Pablo',
            'descripcionUno' => 'Iglesia gótica del siglo XIV, con reformas posteriores renacentistas. Su portada de estilo isabelino y su campanario destacan en la Plaza 1º de Mayo.',
            'descripcionDos' => 'Antiguamente se usaba para actos civiles como juras municipales. Su interior es sobrio, con capillas laterales y un órgano histórico. Visitable y muy activa en Semana Santa.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Iglesia de San Lorenzo',
            'descripcionUno' => 'Templo gótico-renacentista del siglo XIV, recientemente restaurado por la Fundación Huerta de San Antonio. Estuvo en ruinas durante décadas.',
            'descripcionDos' => 'Hoy es centro cultural, con exposiciones y conciertos. Desde su torre se contemplan algunas de las mejores vistas del casco histórico de Úbeda. Acceso libre en horarios culturales.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Hospital de Santiago',
            'descripcionUno' => 'Obra maestra de Vandelvira, construido entre 1562 y 1575. Ejemplo de arquitectura hospitalaria renacentista, llamado el “Escorial andaluz”.',
            'descripcionDos' => 'Incluye iglesia, claustro, patios y una majestuosa escalera imperial. Actualmente es centro cultural, con programación de teatro, ferias y exposiciones. Entrada libre y recomendable.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Palacio Vela de los Cobos',
            'descripcionUno' => 'Palacio renacentista del siglo XVI aún en manos privadas, construido por la familia Vela de los Cobos. Su fachada es sobria pero elegante.',
            'descripcionDos' => 'Se puede visitar con cita previa. El interior conserva mobiliario, biblioteca y decoración de época. Ideal para quienes buscan experiencias culturales más íntimas y auténticas.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Baeza',
            'descripcionUno' => 'Ciudad monumental y tranquila, declarada Patrimonio de la Humanidad junto a Úbeda. Su auge llegó en el siglo XVI como centro universitario y religioso.',
            'descripcionDos' => 'Tiene uno de los cascos históricos mejor conservados de España. Perfecta para recorrer a pie y disfrutar de su ambiente literario y monumental. Antonio Machado vivió y enseñó aquí.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Catedral de Baeza',
            'descripcionUno' => 'Levantada sobre una antigua mezquita, mezcla estilos gótico, renacentista y barroco. La portada principal es renacentista, obra de Vandelvira.',
            'descripcionDos' => 'El interior es amplio, con bóvedas de crucería, retablos y un magnífico coro. Se puede visitar todos los días y desde la torre se divisa toda la ciudad. Entrada gratuita con pase local.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Plaza del Pópulo',
            'descripcionUno' => 'Centro histórico de Baeza, rodeada de edificios renacentistas como la Puerta de Jaén, el archivo de protocolos y la Fuente de los Leones (procedente de Cástulo).',
            'descripcionDos' => 'Es uno de los conjuntos urbanos más armónicos del Renacimiento español. Ideal para comenzar una visita guiada y para hacer fotos. Punto de encuentro habitual para turistas.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Monumento Antonio Machado',
            'descripcionUno' => 'Situado en el patio de la antigua Universidad de Baeza, donde Machado dio clases entre 1912 y 1919. El monumento es un banco de piedra con su escultura sentada.',
            'descripcionDos' => 'Se puede visitar libremente. Hay paneles con poemas y se respira un ambiente literario y nostálgico. Muy valorado por los amantes de la poesía y la historia de España.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Iglesia de San Andrés y Santa María del Alcázar',
            'descripcionUno' => 'Dos templos cercanos en estilo y cronología: gótico-mudéjar del siglo XV. San Andrés conserva interesantes artesonados y capillas; Santa María, una portada de estilo plateresco.',
            'descripcionDos' => 'Son poco frecuentadas pero muy recomendables. Su ambiente recogido y autenticidad permiten una visita más tranquila. Abren durante celebraciones o visitas culturales.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Rus y Canena',
            'descripcionUno' => 'Dos municipios rurales con fuerte tradición olivarera. Rus destaca por su entorno agrícola y tranquilidad. Canena es conocido por su castillo renacentista y sus aguas termales.',
            'descripcionDos' => 'Ambos son paradas ideales para turismo slow y cultural. En sus fiestas patronales se respira autenticidad. Ofrecen una visión real del Jaén profundo y rural.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Castillo de Canena',
            'descripcionUno' => 'Castillo-palacio del siglo XVI, construido sobre una fortaleza árabe. Fue transformado por Andrés de Vandelvira para la familia de los Cobos.',
            'descripcionDos' => 'Es uno de los mejores ejemplos de arquitectura militar y palaciega del Renacimiento. Se puede visitar con reserva. El entorno es tranquilo y las vistas, magníficas.',
        ]);

        // TORREPEROGIL
        LugarInteres::factory()->create([
            'nombre' => 'Minas de agua',
            'descripcionUno' => 'Estas minas, de origen medieval, eran galerías subterráneas que captaban aguas del subsuelo para el riego. Fueron excavadas probablemente entre los siglos XII y XIV, y aún hoy se conservan en buen estado.',
            'descripcionDos' => 'Algunas son visitables con guía y permiten entender los antiguos sistemas hidráulicos. Es un lugar perfecto para combinar historia y naturaleza, y conocer el ingenio agrícola andalusí.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Cortijo de Mainilla',
            'descripcionUno' => 'Antiguo cortijo señorial de finales del siglo XVIII, vinculado a la producción de aceite y cereal. Su arquitectura rural, con patio central y dependencias agrícolas, representa la vida en el campo andaluz.',
            'descripcionDos' => 'Aunque en proceso de recuperación, su entorno natural invita al senderismo y la fotografía. La zona conserva un importante valor etnográfico, muy atractivo para el turismo cultural.',
        ]);

        // SABIOTE
        LugarInteres::factory()->create([
            'nombre' => 'Castillo de Sabiote',
            'descripcionUno' => 'Fortaleza de origen islámico, reformada en el siglo XVI por Francisco de los Cobos y Andrés de Vandelvira, convirtiéndola en palacio renacentista. Su estilo mezcla militar y palaciego.',
            'descripcionDos' => 'Es visitable y conserva torreones, patio y estancias restauradas. Desde sus murallas se obtienen vistas espectaculares del valle. Acoge actividades culturales y teatralizaciones históricas.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Plaza Alonso de Vandelvira',
            'descripcionUno' => 'Centro urbano del municipio, rodeado de casas nobles, la iglesia y edificios administrativos. Recibe el nombre del arquitecto más célebre del Renacimiento jiennense.',
            'descripcionDos' => 'Es punto de partida para explorar el casco histórico, y lugar habitual de encuentros, terrazas y celebraciones. En verano acoge eventos al aire libre.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Barrio del Albaicín',
            'descripcionUno' => 'Antiguo barrio de origen andalusí, con callejuelas estrechas, casas blancas y un encanto muy auténtico. Conserva trazado medieval y restos de arquitectura tradicional.',
            'descripcionDos' => 'Ideal para un paseo sin prisas, especialmente al atardecer. Algunas viviendas restauradas ofrecen alojamiento rural. Se respira historia y tranquilidad.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Paraje Natural La Corregidora',
            'descripcionUno' => 'Zona natural situada a las afueras del municipio, con vistas abiertas al olivar y áreas de descanso. Es ideal para picnics, rutas ciclistas o paseos familiares.',
            'descripcionDos' => 'En primavera destaca por su floración. Dispone de senderos, mesas y sombra. Lugar habitual de romerías y escapadas de fin de semana.',
        ]);

        // EL CONDADO — NAVAS DE SAN JUAN
        LugarInteres::factory()->create([
            'nombre' => 'Mirador de los Calerines',
            'descripcionUno' => 'Ubicado en la sierra que rodea el pueblo, ofrece una vista panorámica del valle y los campos de olivos. Está acondicionado con bancos y paneles informativos.',
            'descripcionDos' => 'Es perfecto para ver amaneceres o atardeceres y tomar fotografías. Se accede fácilmente en coche o caminando desde el casco urbano.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Ayuntamiento de Navas de San Juan',
            'descripcionUno' => 'Edificio de estilo historicista construido a principios del siglo XX, con elementos clásicos y fachada simétrica. Es el centro administrativo del municipio.',
            'descripcionDos' => 'Se encuentra en la Plaza de la Constitución, rodeado de bares y comercios. Desde aquí se organiza gran parte de la vida cultural local.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Ermita de la Virgen de la Estrella',
            'descripcionUno' => 'Templo barroco construido en el siglo XVIII, situado a las afueras del pueblo. Alberga la imagen de la patrona, muy venerada en toda la comarca.',
            'descripcionDos' => 'Durante la romería en mayo, miles de personas se acercan para rendir homenaje. Está rodeada de pinares y dispone de zonas de picnic y descanso.',
        ]);

        // SANTISTEBAN DEL PUERTO
        LugarInteres::factory()->create([
            'nombre' => 'Huellas de Dinosaurio',
            'descripcionUno' => 'Yacimiento paleontológico situado en las afueras del municipio, donde se conservan huellas fosilizadas de dinosaurios del Jurásico Superior.',
            'descripcionDos' => 'Se accede por una ruta señalizada. Cuenta con paneles explicativos y vistas naturales. Muy recomendable para visitas con niños y amantes de la geología.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Mirador de Montaraz',
            'descripcionUno' => 'Situado en una colina al norte del municipio, ofrece vistas panorámicas del valle del Guadalimar y la campiña norte. Cuenta con barandilla y zona de descanso.',
            'descripcionDos' => 'Perfecto para atardeceres y observar aves. Forma parte de la ruta de miradores de El Condado. Se accede por carretera o sendero.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Santuario de Santa María del Collado',
            'descripcionUno' => 'Construido en el siglo XIII sobre restos visigodos, combina elementos románicos y góticos. Alberga a la patrona del pueblo, muy venerada desde la Edad Media.',
            'descripcionDos' => 'Es visitable y destaca por su ubicación sobre una colina. Celebra importantes romerías y fiestas religiosas. Uno de los principales símbolos identitarios de Santisteban.',
        ]);

        // ARROYO DEL OJANCO
        LugarInteres::factory()->create([
            'nombre' => 'Centro de Interpretación de la Cultura Romana',
            'descripcionUno' => 'Ubicado en el centro del pueblo, este museo presenta restos hallados en el yacimiento de Los Torrejones. Incluye mosaicos, cerámica y objetos cotidianos de época romana.',
            'descripcionDos' => 'Ideal para comprender el pasado del municipio y su entorno. Abierto al público con visitas guiadas bajo reserva. Muy recomendable para escolares y amantes de la arqueología.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Iglesia de la Inmaculada Concepción',
            'descripcionUno' => 'Templo barroco del siglo XVIII, construido en mampostería y ladrillo, con portada sencilla y espadaña. Su interior es sobrio, de una sola nave con altar mayor clásico.',
            'descripcionDos' => 'Es el centro espiritual del pueblo y sede de sus principales fiestas religiosas. Se puede visitar en horario de culto y durante las celebraciones patronales de diciembre.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Olivo de Fuentebuena',
            'descripcionUno' => 'Ejemplar milenario de olivo catalogado como árbol singular. Su tronco retorcido y monumental se encuentra a las afueras del núcleo urbano, en un entorno agrícola.',
            'descripcionDos' => 'Es símbolo de longevidad y arraigo en la tierra. Accesible por sendero, se ha acondicionado su entorno para visitas interpretadas. Ideal para fotografía y reflexión.',
        ]);

        // BEAS DE SEGURA
        LugarInteres::factory()->create([
            'nombre' => 'Monasterio de San José del Salvador',
            'descripcionUno' => 'Fundado por Santa Teresa en 1575, es uno de los primeros conventos carmelitas descalzos de Andalucía. Su estilo es sobrio y funcional, con clausura femenina activa.',
            'descripcionDos' => '',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Centro de Interpretación de la Villa de Beas',
            'descripcionUno' => 'Espacio expositivo que recorre la historia del municipio desde la prehistoria hasta la actualidad. Cuenta con piezas arqueológicas, maquetas y audiovisuales.',
            'descripcionDos' => 'Ideal como punto de partida para conocer Beas y su evolución. Entrada gratuita. Abierto en horarios de mañana, con atención personalizada para grupos.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Iglesia y Convento de las Carmelitas Descalzas',
            'descripcionUno' => 'Edificio barroco del siglo XVII adosado al convento fundado por Santa Teresa. Su fachada es sencilla y su interior guarda retablos de gran devoción.',
            'descripcionDos' => 'La iglesia es accesible para el culto y visitas culturales. Es uno de los espacios más venerados por los vecinos. En su altar reposa la imagen del Cristo de Beas.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Murallas Urbanas',
            'descripcionUno' => 'Restos de la antigua muralla medieval que protegía Beas en época musulmana. Aún se conservan tramos de lienzo y torreones visibles desde varias calles del casco antiguo.',
            'descripcionDos' => 'Se integran con las casas actuales y se pueden recorrer a pie. Muy fotogénicas y recomendables para los aficionados al patrimonio defensivo.',
        ]);

        // BENATAE
        LugarInteres::factory()->create([
            'nombre' => 'Iglesia de Nuestra Señora de la Asunción',
            'descripcionUno' => 'Templo de estilo popular andaluz, levantado en el siglo XVII. Su interior es sencillo, con altar mayor de madera y decoración austera.',
            'descripcionDos' => 'Centro religioso de Benatae, participa activamente en fiestas y romerías. Se puede visitar en misas y celebraciones religiosas locales.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Fuente de los Cinco Caños',
            'descripcionUno' => 'Fuente tradicional con cinco surtidores, situada en una plaza céntrica. Era el principal punto de abastecimiento de agua del pueblo.',
            'descripcionDos' => 'Sigue siendo lugar de encuentro vecinal y parada habitual para los visitantes. Refleja el valor del agua en la vida serrana. Ideal para refrescarse y hacer una pausa.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Mirador de Peñalta',
            'descripcionUno' => 'Situado en un saliente rocoso, ofrece una vista panorámica del valle del río Muso y las montañas circundantes. Equipado con barandilla y bancos.',
            'descripcionDos' => 'Lugar ideal para disfrutar del amanecer o la puesta de sol. Punto de paso de rutas senderistas, con acceso desde el pueblo por camino señalizado.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Sendero de la Osera',
            'descripcionUno' => 'Ruta circular de dificultad media que recorre antiguos caminos de pastores, cañones fluviales y formaciones rocosas. Muy rica en flora y fauna.',
            'descripcionDos' => 'Recomendable en primavera y otoño. Hay áreas de descanso y puntos de observación. Forma parte del Parque Natural de Cazorla, Segura y Las Villas.',
        ]);

        // GÉNAVE
        LugarInteres::factory()->create([
            'nombre' => 'Iglesia de la Inmaculada Concepción',
            'descripcionUno' => 'Construida en el siglo XVIII en estilo neoclásico popular, es de nave única con bóveda de cañón. Su portada es sobria y está rematada por espadaña.',
            'descripcionDos' => 'Es el principal templo de Génave y sede de celebraciones religiosas. Se encuentra en la plaza mayor, muy integrada en la vida local.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Castillo de Génave',
            'descripcionUno' => 'Fortaleza de origen islámico reformada tras la conquista cristiana. Actualmente sólo se conservan restos de murallas y estructuras defensivas.',
            'descripcionDos' => 'Se accede por sendero señalizado. Aunque en ruinas, su valor arqueológico es importante y ofrece buenas vistas del entorno natural.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Mirador de Génave',
            'descripcionUno' => 'Pequeño balcón natural acondicionado con baranda y mesas. Desde aquí se ve el caserío, los olivares y montañas que rodean el valle.',
            'descripcionDos' => 'Ideal para parar a contemplar o fotografiar. Buen punto de descanso en rutas de senderismo o cicloturismo.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Fuente de la Camellona',
            'descripcionUno' => 'Fuente tradicional situada a las afueras del pueblo, rodeada de pinos y lavandas. Ha sido restaurada y es accesible desde una ruta circular.',
            'descripcionDos' => 'Lugar frecuentado por locales para llenar botellas. Parte del recorrido natural entre Génave y el río Guadalimar. Buen lugar para descansar.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Ruta de los Miradores',
            'descripcionUno' => 'Conjunto de miradores señalizados que recorren Génave y su entorno, conectando patrimonio, naturaleza y cultura popular.',
            'descripcionDos' => 'Ideal para conocer el pueblo a pie. Cada parada tiene paneles informativos y bancos. Recomendado para fotografía y turismo familiar.',
        ]);

        // HORNOS
        LugarInteres::factory()->create([
            'nombre' => 'Castillo de Hornos',
            'descripcionUno' => 'Castillo roquero de origen islámico, reformado tras la conquista cristiana en el siglo XIII. Su posición estratégica sobre una peña lo hace espectacular.',
            'descripcionDos' => 'Se accede desde la plaza del pueblo y actualmente acoge el Cosmolarium, un centro de divulgación astronómica. Visita obligada por su historia y sus vistas.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Iglesia de Nuestra Señora de la Asunción',
            'descripcionUno' => 'Templo de origen gótico renacentista, construido en el siglo XVI. Su portada es sobria y su interior de una sola nave con capillas laterales.',
            'descripcionDos' => 'Se encuentra junto al castillo, formando un conjunto monumental único. Está abierta en horario litúrgico y durante eventos culturales.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Mirador del Aguilón',
            'descripcionUno' => 'Mirador natural situado a las afueras del casco urbano, con vistas al pantano del Tranco y las sierras de alrededor. Cuenta con barandilla y paneles interpretativos.',
            'descripcionDos' => 'Ideal para observar aves rapaces, disfrutar del paisaje o descansar tras una ruta. Accesible en coche o a pie.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Mirador Las Celadillas',
            'descripcionUno' => 'Ubicado en una zona elevada del municipio, este mirador ofrece vistas hacia la vertiente oriental del parque natural. Menos concurrido, pero muy espectacular.',
            'descripcionDos' => 'Muy recomendable al amanecer. Se integra en rutas senderistas locales. Buen punto para avistar cabras montesas en libertad.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Pantano del Tranco',
            'descripcionUno' => 'Gran embalse construido en los años 40 sobre el río Guadalquivir. Aporta regadío y electricidad a la comarca. Rodeado de un entorno natural protegido.',
            'descripcionDos' => 'Se puede navegar en barco solar, hacer kayak o disfrutar de áreas recreativas. En verano hay chiringuitos y rutas señalizadas. Es uno de los puntos más visitados de la Sierra de Segura.',
        ]);

        // LA PUERTA DE SEGURA
        LugarInteres::factory()->create([
            'nombre' => 'Paseo del río Guadalimar',
            'descripcionUno' => 'Paseo fluvial acondicionado junto al casco urbano, con bancos, vegetación de ribera y zonas de sombra. Ideal para caminar al atardecer o hacer deporte.',
            'descripcionDos' => 'Atractivo para familias y mayores. Muy frecuentado en verano. Une tradición, paisaje y tranquilidad junto al agua.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Castillo de Bujalamé',
            'descripcionUno' => 'Ruinas de una antigua fortaleza árabe situada en lo alto de un cerro cercano al pueblo. Tuvo función defensiva hasta el siglo XV.',
            'descripcionDos' => 'Accesible por sendero. Aunque queda poca estructura, el lugar ofrece buenas vistas y tiene valor arqueológico. Hay paneles informativos.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Iglesia de San Mateo',
            'descripcionUno' => 'Iglesia barroca del siglo XVIII, de una sola nave con altar mayor clásico. Su campanario es uno de los más visibles del perfil urbano.',
            'descripcionDos' => 'Es el centro religioso del municipio. Acoge misas y procesiones. Se puede visitar en horarios de culto o eventos culturales.',
        ]);

        // ORCERA
        LugarInteres::factory()->create([
            'nombre' => 'Iglesia de Nuestra Señora de la Asunción',
            'descripcionUno' => 'La Iglesia de Nuestra Señora de la Asunción es el principal templo religioso de Orcera. Fue construida en el siglo XVI, en pleno auge del estilo renacentista andaluz, probablemente sobre un templo anterior de origen medieval. Su fachada principal, sobria y elegante, está rematada por una portada de piedra labrada con arco de medio punto flanqueado por columnas dóricas. La espadaña, de construcción posterior, añade un toque distintivo al conjunto. El templo destaca por su equilibrio arquitectónico y por su integración en el entorno del casco antiguo.',
            'descripcionDos' => 'En su interior, de nave única, se conservan varios retablos de valor artístico y devocional, entre ellos el de la Virgen de la Asunción, patrona de la localidad. La iglesia alberga también imágenes procesionales de gran arraigo en la Semana Santa de Orcera. Es escenario habitual de bodas, comuniones, misas dominicales y, sobre todo, de las fiestas patronales que tienen lugar a mediados de agosto. Abre sus puertas durante las celebraciones litúrgicas y en visitas concertadas, siendo un punto clave del patrimonio histórico y espiritual de la comarca de la Sierra de Segura.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Torres de Santa Catalina',
            'descripcionUno' => 'Conjunto de restos defensivos situado sobre un cerro que domina la localidad de Orcera, probablemente de origen musulmán y vinculado al antiguo sistema de vigilancia de la Sierra de Segura durante la Edad Media. Aunque hoy solo se conservan fragmentos de muros y cimientos, se cree que formaba parte de una pequeña fortificación o atalaya con función de control visual del valle y de protección del núcleo poblacional.',
            'descripcionDos' => 'El lugar es accesible mediante un corto sendero desde el casco urbano y ofrece una de las mejores vistas panorámicas del municipio y su entorno natural. Se ha convertido en un punto habitual para caminantes y visitantes interesados en la historia medieval de la zona. No cuenta con infraestructura turística, pero su valor paisajístico y patrimonial lo hacen una parada recomendable dentro de cualquier ruta por Orcera.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Piscina de Amurjo',
            'descripcionUno' => 'Piscina natural de aguas cristalinas formada en el cauce del arroyo Amurjo, uno de los principales afluentes del río Orcera. Este espacio ha sido acondicionado con escolleras de piedra para facilitar el baño durante los meses de verano. Está rodeado de una frondosa vegetación de ribera que proporciona sombra natural, lo que lo convierte en un enclave refrescante y muy frecuentado por locales y visitantes.',
            'descripcionDos' => 'El área cuenta con merenderos, bancos, papeleras y zonas habilitadas para el descanso y el picnic. Se accede fácilmente a pie o en vehículo desde el núcleo urbano de Orcera. Es uno de los lugares más populares durante los meses cálidos, especialmente en agosto, cuando se convierte en punto de reunión para familias, jóvenes y senderistas. Además, es un buen ejemplo de integración de la infraestructura turística con el medio natural.',
        ]);


        // PUENTE DE GÉNAVE

        LugarInteres::factory()->create([
            'nombre' => 'Almazara de la Vicaría',
            'descripcionUno' => 'Antigua almazara del siglo XIX restaurada y acondicionada como espacio museístico en Puente de Génave. En su interior se conserva una muestra completa de maquinaria original utilizada en el proceso tradicional de extracción del aceite de oliva, como la prensa de viga, la muela de piedra y los capachos de esparto.',
            'descripcionDos' => 'El centro ofrece visitas guiadas, especialmente dirigidas a escolares y grupos turísticos, con explicaciones sobre el cultivo del olivo, la recolección de la aceituna y la evolución de las técnicas de producción del aceite. También se realizan pequeñas degustaciones. Es un recurso didáctico clave para entender la importancia del olivar en la economía y la cultura de la Sierra de Segura.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Torres de Peñolite',
            'descripcionUno' => 'Restos de un conjunto defensivo medieval vinculado a la antigua red de torres vigía que protegían el valle del Guadalimar. Se cree que su origen está en la época andalusí, cuando estas torres formaban parte de un sistema de control visual y aviso frente a incursiones.',
            'descripcionDos' => 'Se encuentran integradas en el pequeño núcleo de Peñolite, una aldea de gran encanto perteneciente a Puente de Génave. Aunque quedan solo fragmentos de muros y estructuras, su valor histórico y paisajístico es notable. Se puede acceder a pie desde el centro del pueblo por un sendero señalizado entre olivares y huertas tradicionales.',
        ]);

        // SANTIAGO-PONTONES
            LugarInteres::factory()->create([
                'nombre' => 'Nacimiento del Río Segura',
                'descripcionUno' => 'Ubicado en el paraje natural de Fuente Segura, es uno de los espacios más icónicos del Parque Natural de las Sierras de Cazorla, Segura y Las Villas. El río Segura, uno de los más importantes del sureste peninsular, brota desde una cueva en la roca caliza, justo al pie de una pequeña cascada que forma un estanque de aguas turquesas rodeado de vegetación de ribera.',
                'descripcionDos' => 'El entorno ha sido acondicionado con senderos, zonas de descanso, pasarelas y señalización interpretativa. La belleza del paisaje es especialmente notable en primavera y verano, cuando el caudal es más abundante. Es muy frecuentado por excursionistas, familias y amantes de la naturaleza. El acceso en vehículo está permitido hasta un aparcamiento cercano, desde el que se camina unos minutos hasta el nacimiento.',
            ]);

            LugarInteres::factory()->create([
                'nombre' => 'Iglesia Parroquial de Santiago Apóstol',
                'descripcionUno' => 'Templo renacentista del siglo XVI situado en el núcleo de Santiago de la Espada, capital administrativa del extenso municipio de Santiago-Pontones. Construida en sillería, su fachada principal es sobria, con una portada de medio punto y espadaña de campanas. El edificio ha sufrido varias reformas a lo largo de los siglos, manteniendo un aire tradicional serrano.',
                'descripcionDos' => 'En su interior se conservan retablos barrocos y tallas de devoción popular, siendo un espacio muy ligado a la vida cultural y religiosa del pueblo. Es sede de las fiestas patronales en honor a Santiago Apóstol, celebradas en el mes de julio, que incluyen procesiones, música y actividades populares. Se puede visitar durante los actos litúrgicos o mediante cita con la parroquia.',
            ]);


        LugarInteres::factory()->create([
            'nombre' => 'Centro de Visitantes Torre del Vinagre',
            'descripcionUno' => 'Centro de interpretación del parque natural, con exposiciones sobre flora, fauna y etnografía de la Sierra. Cuenta con tienda y áreas de descanso.',
            'descripcionDos' => 'Es punto de partida ideal para explorar la zona. Muy recomendable para familias y amantes de la naturaleza. Abierto todo el año.',
        ]);

        // SEGURA DE LA SIERRA
        LugarInteres::factory()->create([
            'nombre' => 'Castillo de Segura de la Sierra',
            'descripcionUno' => 'Fortaleza árabe del siglo XI reformada en época cristiana. Se alza sobre la cima del pueblo, con torres, murallas y vistas únicas.',
            'descripcionDos' => 'Se puede visitar y es uno de los castillos más espectaculares de Jaén. Forma parte del conjunto histórico declarado Bien de Interés Cultural.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Fuente Imperial de Carlos V',
            'descripcionUno' => 'Fuente monumental construida en 1559 en honor al emperador. De estilo renacentista, con escudo imperial y pilón tallado.',
            'descripcionDos' => 'Situada a la entrada del casco histórico. Buen lugar para hacer fotos y refrescarse tras la subida al castillo.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Mirador de Peñalta',
            'descripcionUno' => 'No debe confundirse con el de Benatae. Ofrece una panorámica de los picos de la sierra y del caserío escalonado del pueblo.',
            'descripcionDos' => 'Muy visitado por senderistas y turistas. Accesible a pie desde el centro histórico. Ideal para ver la puesta de sol.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Baños Árabes',
            'descripcionUno' => 'Pequeños baños de origen andalusí excavados en roca, con salas diferenciadas. Fueron descubiertos en el siglo XX y están parcialmente restaurados.',
            'descripcionDos' => 'Visitas guiadas bajo reserva. Representan el legado musulmán en el corazón de Segura. Muy valorados por los interesados en la historia medieval.',
        ]);

        // SILES
        LugarInteres::factory()->create([
            'nombre' => 'Arco de la Malena',
            'descripcionUno' => 'Antigua puerta de entrada al casco amurallado. Se remonta al siglo XIII, de época musulmana. Conserva parte del arco de herradura original.',
            'descripcionDos' => 'Fotogénico y bien conservado. Está integrado en el centro histórico, junto a casas blancas y calles empedradas.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Arco de San Gregorio',
            'descripcionUno' => 'Otro acceso histórico a la villa medieval. Fue reconstruido en el siglo XV tras la conquista cristiana, con dovelas en piedra.',
            'descripcionDos' => 'Marca la entrada al barrio más antiguo. Es habitual en rutas históricas guiadas por el municipio. Se encuentra cerca de la plaza.',
        ]);
        LugarInteres::factory()->create([
            'nombre' => 'Torre del Cubo',
            'descripcionUno' => 'Torre defensiva circular del siglo XIII, de época islámica, construida en mampostería. Formaba parte del sistema amurallado que protegía el núcleo urbano de Siles.',
            'descripcionDos' => 'Se puede rodear a pie por un pequeño sendero. Cuenta con paneles informativos y es uno de los perfiles más reconocibles del pueblo, visible desde distintos puntos del casco antiguo.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Ermita de San Roque',
            'descripcionUno' => 'Ermita sencilla del siglo XVII, construida en honor al patrón del pueblo. Se encuentra en un cerro que domina la entrada a Siles, rodeada de pinares.',
            'descripcionDos' => 'Cada mes de agosto se celebra una romería muy concurrida. Desde la ermita se contemplan vistas panorámicas del valle del río Morles y del entorno rural del municipio.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Área recreativa Peña del Olivar',
            'descripcionUno' => 'Espacio natural junto al río Muso, equipado con piscinas, zonas de sombra, barbacoas, merenderos y áreas para el baño y el descanso.',
            'descripcionDos' => 'Es muy frecuentado en verano por familias y senderistas. Desde aquí parten varias rutas de senderismo señalizadas, algunas de ellas conectan con antiguos molinos harineros.',
        ]);

        // TORRES DE ALBANCHEZ
        LugarInteres::factory()->create([
            'nombre' => 'Torre del Homenaje',
            'descripcionUno' => 'Construcción defensiva del siglo XIII, de planta cuadrada, erigida durante el periodo islámico. Era el punto más alto del desaparecido castillo de Torres de Albanchez.',
            'descripcionDos' => 'Restaurada parcialmente, es visible desde gran parte del municipio. Se accede a pie mediante un sendero corto. Aparece representada en el escudo local como símbolo de identidad.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Castillo de la Yedra',
            'descripcionUno' => 'Antiguo castillo situado en una zona boscosa a las afueras del municipio, no relacionado con el de Cazorla pese a compartir nombre. Apenas se conservan restos visibles.',
            'descripcionDos' => 'Quedan estructuras de piedra y restos de muros, accesibles mediante sendero o visita guiada. Ideal para quienes disfrutan del turismo arqueológico y la historia rural.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Iglesia de Nuestra Señora de la Presentación',
            'descripcionUno' => 'Templo barroco del siglo XVII con portada sobria y campanario. Se encuentra en el centro de Torres de Albanchez, presidiendo la plaza del pueblo.',
            'descripcionDos' => 'En su interior destaca la imagen de la patrona y un retablo de estilo neoclásico. Es lugar de culto activo y centro de las principales celebraciones religiosas locales.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Ruta de Senderismo al Castillo',
            'descripcionUno' => 'Sendero circular que asciende desde el núcleo urbano hasta los restos del castillo. De dificultad media, bien señalizado y con puntos panorámicos.',
            'descripcionDos' => 'Durante el recorrido se aprecian vistas de la Sierra de Alcaraz y del valle circundante. Es recomendable especialmente en primavera y otoño por la vegetación y el clima templado.',
        ]);

        // Marmolejo
        LugarInteres::factory()->create([
            'nombre' => 'El Pantanillo',
            // 'latitud' => 38.0592,
            // 'longitud' => -3.8234,
            // 'poblacion_id' => 1,
            'descripcionUno' => 'El Pantanillo de Marmolejo es un pequeño embalse natural ubicado en la Finca Municipal de La Dehesilla, al noroeste del término municipal de Marmolejo, en la provincia de Jaén. Este paraje combina zonas de bosque mediterráneo y dehesa, ofreciendo un entorno de gran valor ecológico y paisajístico.',
            'descripcionDos' => 'El Pantanillo es uno de los puntos destacados de las rutas de senderismo que atraviesan la finca, proporcionando un espacio ideal para la observación de flora y fauna autóctonas, como encinas, jaras y madroños, así como diversas especies de aves y otros animales silvestres. Además, La Dehesilla cuenta con instalaciones para actividades recreativas y de turismo rural, como acampadas y piragüismo, lo que convierte al Pantanillo en un lugar perfecto para disfrutar de la naturaleza en estado puro.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Castillo de la Aragonesa',
            'descripcionUno' => 'El Castillo de la Aragonesa es una fortaleza de origen islámico situada en el paraje de La Aragonesa, cerca del poblado de San Julián, en el término municipal de Marmolejo, provincia de Jaén. Construido durante la dominación islámica, fue posteriormente transformado en residencia señorial tras la conquista cristiana.',
            'descripcionDos' => 'El castillo presenta una planta rectangular, conservando lienzos de tres de sus lados realizados en tapial. Destaca su torre del homenaje de tres plantas, datada en el siglo XV, y torres cilíndricas macizas en tres de sus ángulos.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Puente de San Bartolomé',
            'descripcionUno' => 'El Puente de San Bartolomé, también conocido como el Puente del Balneario, es una destacada obra de ingeniería renacentista situada en Marmolejo. Su construcción se inició en 1550 bajo la dirección del maestro cantero Benito del Castillo y concluyó en 1587 . El puente se extiende 129 metros sobre el río Guadalquivir y presenta una estructura de siete arcos de medio punto, dos de ellos de mayor tamaño, con una altura máxima de 25 metros en su arco central.',
            'descripcionDos' => 'La fábrica del puente combina sillares de piedra rojiza, conocidos localmente como "azucareña", en su tramo original del siglo XVI, y elementos de ladrillo en las bóvedas de los arcos añadidos en el siglo XIX . Esta ampliación se llevó a cabo para reparar los daños sufridos por el puente, que en el siglo XIX se encontraba parcialmente derruido, siendo necesario cruzarlo mediante tablones. En reconocimiento a su valor histórico y arquitectónico, el Puente de San Bartolomé fue declarado Bien de Interés Cultural en 2011, junto con el Balneario de Marmolejo y sus jardines . Actualmente, el puente sigue en uso, permitiendo el paso entre Marmolejo y las tierras de la vega, y constituye un símbolo del patrimonio y la identidad local.',
        ]);

        // Arjona y Arjonilla
        LugarInteres::factory()->create([
            'nombre' => 'Castillo del Trovador Macías',
            'descripcionUno' => 'El Castillo del Trovador Macías, también conocido como Castillo de Arjonilla, es una fortaleza medieval ubicada en el casco urbano de Arjonilla, en la provincia de Jaén. Su origen se remonta al siglo XII, cuando los almohades construyeron un recinto fortificado para proteger la alquería local. Tras la conquista cristiana, el castillo pasó por diversas manos, incluyendo la Orden de Calatrava en el siglo XV, que realizó importantes reformas en su estructura. La fortaleza destaca por su planta rectangular y su imponente torre del homenaje, construida en mampostería y sillería. En el siglo XVII, se añadió una casa palaciega en su interior. Actualmente, el castillo se encuentra en estado de conservación regular y es de titularidad pública. Desde 2013, se han llevado a cabo campañas de restauración y estudios arqueológicos para su puesta en valor.',
            'descripcionDos' => 'El castillo es célebre por la leyenda de Macías el Enamorado, un trovador gallego del siglo XIV que, según la tradición, se enamoró de doña Elvira, esposa del hidalgo Hernán Pérez de Vadillo. Descubierto su amor prohibido, Macías fue encarcelado en la torre del castillo, donde continuó cantando a su amada hasta que fue asesinado por el celoso marido. Esta trágica historia inspiró obras literarias como Porfiar hasta morir de Lope de Vega y El doncel de don Enrique el Doliente de Mariano José de Larra.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Iglesia de la Encarnación',
            'descripcionUno' => 'La Iglesia de Nuestra Señora de la Encarnación es el principal templo parroquial de Arjonilla, en la provincia de Jaén. Su construcción comenzó a principios del siglo XVI en estilo gótico tardío y se prolongó hasta los siglos XVII y XVIII, incorporando elementos renacentistas y manieristas.',
            'descripcionDos' => 'El edificio presenta una planta basilical con testero plano, dividida en tres naves separadas por pilares compuestos con finas columnas adosadas. Las bóvedas de crucería descansan sobre arcos apuntados, y la cabecera plana está cubierta por terceletes.',

        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Ermita de la Virgen de la Cabeza',
            'descripcionUno' => 'La Ermita de la Virgen de la Cabeza de Arjona, también conocida como Capilla de la Virgen de la Cabeza, es un pequeño templo ubicado en la intersección de las calles Reloj y Canalejas, en el centro histórico de Arjona. Este edificio alberga la imagen de la Virgen de la Cabeza, una de las advocaciones marianas más veneradas en la región. La devoción a la Virgen de la Cabeza en Arjona se remonta al siglo XIII, cuando, según la tradición, la Virgen se apareció a un pastor en el Cerro de la Cabeza, en Sierra Morena.',
            'descripcionDos' => 'Desde entonces, la imagen ha sido objeto de gran veneración en la localidad. Cada primer domingo de mayo, la Cofradía de la Virgen de la Cabeza de Arjona organiza una procesión en honor a la Virgen, destacando por su colorido y participación popular.La Ermita de la Virgen de la Cabeza de Arjona no solo es un lugar de culto, sino también un símbolo de la identidad cultural y religiosa de la localidad, siendo escenario de importantes celebraciones y manifestaciones de fe popular.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Iglesia de San Juan Bautista',
            'descripcionUno' => 'La Iglesia de San Juan Bautista de Arjona, situada en la Plaza Juan Antonio León García, es uno de los templos más emblemáticos de la localidad jiennense. Su historia se remonta al siglo XVI, aunque se cree que el lugar ya albergaba un templo romano dedicado a Baco, posteriormente convertido en sinagoga durante la Edad Media, antes de ser transformado en iglesia cristiana.',
            'descripcionDos' => 'El edificio original, de estilo gótico tardío, fue prácticamente destruido durante la Guerra Civil Española en 1936. De la construcción primitiva se conserva la portada plateresca, realizada en 1531 por Juan de Marquina, considerada uno de los primeros ejemplos renacentistas de la ciudad.
            La reconstrucción del templo se llevó a cabo en la segunda mitad del siglo XX, bajo la dirección del arquitecto Fernando Wilhemi Manzano. Durante esta etapa se erigió la actual torre octogonal de piedra, coronada por un campanario abierto de ladrillo con vanos semicirculares y un chapitel.',
        ]);

        // Porcuna
        LugarInteres::factory()->create([
            'nombre' => 'Torre Nueva o Torre de Boabdil',
            'descripcionUno' => 'La Torre Nueva o Torre de Boabdil es una imponente torre del homenaje situada en el centro histórico de Porcuna, Jaén. Construida entre 1411 y 1435 por la Orden de Calatrava, según indica una lápida conmemorativa en su fachada, esta torre fue erigida bajo la dirección del maestre don Luis de Guzmán.
            La torre debe su nombre a la tradición que señala que en ella estuvo prisionero Boabdil "El Chico", último rey nazarí de Granada, tras ser capturado en la batalla de Lucena en 1483 .',
            'descripcionDos' => 'ctualmente, la torre alberga el Museo Arqueológico Municipal de Obulco, que exhibe piezas desde la prehistoria hasta la época islámica, incluyendo esculturas ibéricas y objetos romanos.
            Declarada Bien de Interés Cultural en 1982, la Torre de Boabdil es un símbolo del patrimonio histórico de Porcuna y un destacado ejemplo de arquitectura militar medieval en Andalucía.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Necrópolis Dinástica de Cerrillo Blanco',
            'descripcionUno' => 'Situada a unos tres kilómetros al norte de Porcuna (Jaén), es uno de los yacimientos arqueológicos más relevantes de la cultura ibérica en la península ibérica. Su origen se remonta al siglo VII a.C., en época tartésica, cuando se estableció como un túmulo funerario destinado a la inhumación de miembros de una aristocracia local, posiblemente vinculada a la antigua ciudad de Ibolca, antecesora de la romana Obulco.
            La necrópolis cuenta con 24 sepulturas individuales en fosa y una tumba megalítica que albergó a dos individuos. Estas estructuras reflejan las prácticas funerarias de una sociedad jerarquizada, donde la disposición de las tumbas y su orientación parecen obedecer a criterios simbólicos y rituales.',
            'descripcionDos' => 'Uno de los hallazgos más destacados del yacimiento es el conjunto escultórico ibérico descubierto en 1975. Este conjunto, compuesto por aproximadamente 1.400 fragmentos, representa escenas de guerreros, cazadores, animales reales y mitológicos, así como figuras de carácter ritual. Las esculturas, talladas en arenisca fina, presentan una notable influencia del arte griego arcaico y fueron deliberadamente destruidas y enterradas hacia el siglo V a.C., posiblemente como parte de un ritual de renovación o por motivos políticos.',

        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Yacimiento íbero-romano de Obulco',
            'descripcionUno' => 'Obulco, conocida en época íbera como Ibolca, fue una ciudad-estado túrdula que acuñaba su propia moneda y poseía una aristocracia guerrera, como lo evidencian las esculturas halladas en la necrópolis de Cerrillo Blanco. Durante la dominación romana, Obulco adquirió gran relevancia estratégica y política.',
            'descripcionDos' => 'Autores clásicos como Plinio, Ptolomeo y Estrabón la mencionan, y se sabe que apoyó a Julio César en la guerra civil contra Pompeyo. Según Estrabón, en Obulco se preparó la decisiva batalla de Munda en el año 45 a.C.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Casa de la Piedra',
            'descripcionUno' => 'La Casa de la Piedra es una singular obra arquitectónica ubicada en el Paseo de Jesús de Porcuna (Jaén), construida casi en su totalidad por el cantero local Antonio Aguilera Rueda, conocido como Gronzón. Este proyecto, iniciado el 14 de enero de 1931, se prolongó durante 29 años y fue culminado el 10 de mayo de 1960, convirtiéndose en un símbolo de perseverancia y habilidad artesanal.',
            'descripcionDos' => 'La construcción se realizó sin planos ni asistencia técnica, utilizando piedra extraída de las canteras locales. Gronzón llevó a cabo el desescombro del solar, retirando más de 2.000 carros de escombros con la ayuda de una burra blanca y un carrito volquete. Posteriormente, almacenó miles de carros de piedra durante dos años antes de comenzar los trabajos de cimentación. El labrado de la piedra y la edificación fueron realizados por él mismo, con la colaboración de sus hijos una vez que alcanzaron la edad suficiente para ayudar.',

        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Parroquia Nuestra Señora de la Asunción',
            
            'descripcionUno' => 'La parroquia de Nuestra Señora de la Asunción es el principal templo católico de Porcuna (Jaén) y un símbolo destacado de su patrimonio histórico y cultural. Fue construida entre 1903 y 1910 sobre los restos de la antigua iglesia gótica de Santa María la Mayor, que se derrumbó parcialmente en el siglo XIX. Del templo original se conservó la sacristía, reformada en el siglo XVII por el arquitecto manierista Benito del Castillo. El nuevo edificio fue proyectado por el arquitecto Justino Flórez Llamas en un estilo neorrománico-bizantino, adaptado a los recursos disponibles y con el apoyo económico de la comunidad local.',
            'descripcionDos' => 'Arquitectónicamente, la iglesia destaca por su eclecticismo revivalista. En el interior, presenta un amplio pórtico o nártex, pilares cruciformes, arcos fajones y formeros, bóvedas de crucería, y una cúpula sobre pechinas en el crucero. En el exterior, sobresale una alta torre con arquivolta y rosetón, contrafuertes, sillares almohadillados, óculos y una escalinata que resuelve el desnivel del terreno.
            La parroquia de Nuestra Señora de la Asunción no solo es un lugar de culto, sino también un centro de actividad cultural y social en Porcuna. Ubicada en la Plaza de Andalucía, constituye un punto de encuentro para la comunidad y alberga diversas celebraciones religiosas y eventos culturales a lo largo del año.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Museo Arqueológico de Porcuna',
            'descripcionUno' => 'El Museo Arqueológico Municipal de Obulco, ubicado en la Torre Nueva o Torre de Boabdil del siglo XV, es una institución clave para comprender la evolución histórica de Porcuna (Jaén), desde la prehistoria hasta la época romana. Inaugurado en 1980, el museo ofrece un recorrido cronológico por las distintas etapas culturales que han dejado su huella en la región, destacando la importancia de la ciudad íbero-romana de Obulco.
            La exposición se distribuye en dos plantas: la primera alberga colecciones del Paleolítico y Neolítico, con útiles líticos y cerámica a mano, así como objetos de la cultura ibérica de la ciudad-estado de Ipolca, incluyendo cerámica decorada y urnas funerarias. La segunda planta está dedicada a la época hispano-romana, mostrando elementos arquitectónicos, inscripciones y objetos cotidianos que reflejan la vida en Obulco durante la dominación romana.',
            'descripcionDos' => 'Además, el museo cuenta con una terraza que ofrece vistas panorámicas de la campiña de Jaén y Córdoba, y una sala dedicada a la localización de yacimientos y monumentos en el entorno de Porcuna, como Cerrillo Blanco y la ciudad de Obulco. Este espacio no solo enriquece la comprensión del patrimonio arqueológico local, sino que también destaca la relevancia de Porcuna como enclave histórico en la península ibérica.',
        ]);

        // Lopera
        LugarInteres::factory()->create([
            'nombre' => 'Castillo de Lopera',
            'descripcionUno' => 'Situado en el centro de la localidad homónima en la provincia de Jaén, es una destacada fortaleza medieval construida por la Orden Militar de Calatrava en la segunda mitad del siglo XIII. Levantado sobre un antiguo recinto amurallado islámico, su ubicación estratégica permitía el control del valle del Guadalquivir y de la rica zona agrícola de la campiña baja.
            Esta imponente construcción de planta pentagonal irregular está defendida por cinco torres en sus esquinas, algunas cilíndricas y otras prismáticas, y presenta singulares balcones amatacanados que garantizaban la protección de las puertas y de algunos torreones. ',
            'descripcionDos' => 'En su interior, se organiza en torno a un patio de armas que incluye dos magníficas torres de homenaje: la Torre de Santa María y la Torre de San Miguel. La primera alberga una capilla gótica construida en 1535, mientras que la segunda, desmochada, controlaba el acceso al alcázar.
            A lo largo de los siglos, el castillo ha desempeñado diversos roles, desde residencia nobiliaria hasta bodega en el siglo XX. Fue declarado Bien de Interés Cultural en 1991 y, desde 2002, es de propiedad municipal . Actualmente, forma parte de la Ruta de los Castillos y las Batallas, subrayando su importancia cultural y turística en la región.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Trincheras y búnkeres de la Guerra Civil',
            'descripcionUno' => 'Lopera, en la provincia de Jaén, conserva un notable conjunto de vestigios de la Guerra Civil Española, testimonio de su papel estratégico durante el conflicto. Entre el 27 y el 29 de diciembre de 1936, la localidad fue escenario de la Batalla de Lopera, donde la XIV Brigada Internacional intentó recuperar el control del municipio, resultando en una de las acciones más cruentas del frente andaluz. Este enfrentamiento dejó numerosas estructuras defensivas que aún pueden observarse en el término municipal.
            Entre los elementos más destacados se encuentran dos nidos de ametralladoras junto al Puente del Arroyo Salado, conocidos popularmente como "trincheras". Estas estructuras, construidas con bloques de hormigón armado, hierros entrecruzados y pequeños trozos de piedra, formaban parte de las defensas nacionales. ',
            'descripcionDos' => 'En el Cerro de las Esperillas se hallan trincheras republicanas excavadas en piedra viva, aunque actualmente se encuentran parcialmente cubiertas por escombros y vegetación. Además, en el paraje de Valcargado, junto a la antigua carretera nacional Madrid-Cádiz, se conserva un búnker antitanque de forma cuadrangular, construido con bloques de hormigón y ladrillo, que fue utilizado como vivienda tras la contienda. A unos treinta metros de este fortín, existe otro nido de ametralladoras semicirculares, con un pequeño semisótano y un agujero posterior para la instalación de armamento. En el Cerro Morrón, se encuentra otro nido de ametralladoras en forma triangular, utilizado como observatorio, aunque en mal estado de conservación. Asimismo, se conservan refugios de la guerra civil en algunas viviendas de Lopera, como los de las familias Peña Medina, Rueda, Merino y la casa del Holandés, así como once cuevas a la entrada de Lopera por la carretera de Porcuna, utilizadas como refugios durante el conflicto.
            Estos vestigios no sólo representan un patrimonio histórico de gran valor, sino que también sirven como recordatorio de los horrores de la guerra y la importancia de preservar la memoria histórica. El municipio de Lopera ha sido escenario de iniciativas para la recuperación y puesta en valor de estos elementos, incluyendo la creación de rutas temáticas y la celebración de congresos internacionales sobre la Guerra Civil y las Brigadas Internacionales, destacando la relevancia de estos lugares en la historia contemporánea de España.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Museo de la Batalla',
            'descripcionUno' => 'El Museo de la Batalla de Lopera, ubicado en el histórico castillo de la localidad, es el primer espacio museístico en Andalucía dedicado exclusivamente a la Guerra Civil Española y, en particular, a la Batalla de Lopera, ocurrida entre el 27 y el 29 de diciembre de 1936. Este enfrentamiento, uno de los más cruentos del Frente Sur, involucró a la XIV Brigada Internacional y dejó una profunda huella en la historia local. El museo nace gracias a la generosa donación de Pedro Ruiz Navarrete, presidente de la Asociación Batalla de Lopera, quien cedió su extensa colección de objetos y documentos relacionados con el conflicto.',
            'descripcionDos' => 'La exposición permanente alberga más de 300 piezas, incluyendo uniformes, armas desactivadas, fotografías, documentos originales y objetos personales de combatientes. Estos elementos ofrecen una visión detallada de la vida en el frente y de las experiencias de quienes participaron en la batalla. El museo se integra en la Ruta de los Castillos y las Batallas, consolidando a Lopera como un referente en la preservación de la memoria histórica y democrática en España.
            El Ayuntamiento de Lopera, en colaboración con la Asociación Batalla de Lopera, trabaja en la adecuación del castillo para albergar adecuadamente la colección, garantizando su conservación y accesibilidad. Este proyecto no solo enriquece el patrimonio cultural de la localidad, sino que también sirve como herramienta educativa y de reflexión sobre las consecuencias del conflicto, contribuyendo al conocimiento y la comprensión de un periodo crucial en la historia reciente de España',
        ]);

        // Alcalá la Real
        LugarInteres::factory()->create([
            'nombre' => 'Fortaleza de la Mota',
            'descripcionUno' => 'La Fortaleza de la Mota, ubicada en Alcalá la Real, es uno de los castillos más emblemáticos de la provincia de Jaén. Su origen se remonta a la época islámica, cuando fue erigida como una fortificación estratégica para controlar el paso entre el Reino de Granada y el resto de la península. Durante la Reconquista, este lugar fue testigo de intensos combates entre cristianos y musulmanes. Con el tiempo, la fortaleza fue ampliada y adaptada a las necesidades de los reyes castellanos. En su interior, destaca la Torre del Homenaje, desde la cual se tiene una impresionante vista panorámica del municipio y la comarca.',
            'descripcionDos' => 'El acceso a la fortaleza es a través de un laberinto de calles empedradas que conservan la esencia medieval del pueblo. Actualmente, el castillo es uno de los principales atractivos turísticos de Alcalá la Real, donde se pueden realizar visitas guiadas que permiten conocer la historia del lugar, su arquitectura defensiva y la vida cotidiana en la Edad Media. Además, la fortaleza alberga diversas exposiciones culturales y eventos durante todo el año, lo que la convierte en un punto de encuentro para los amantes de la historia y la cultura.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'La Alcazaba',
            'descripcionUno' => 'La Alcazaba de Alcalá la Real es una antigua fortaleza islámica construida en el siglo XI sobre una colina estratégica que domina la ciudad. Originalmente, su función era proteger el territorio del Reino de Granada y servir como residencia para los gobernantes musulmanes. A lo largo de los siglos, sufrió varias modificaciones, especialmente durante la Reconquista, cuando los Reyes Católicos la tomaron en 1486. Su estructura incluye murallas, torres, y varios accesos, lo que hace de la Alcazaba un impresionante ejemplo de la arquitectura militar islámica.
            ',
            'descripcionDos' => 'En la actualidad, la Alcazaba es un excelente punto de partida para conocer la historia de Alcalá la Real. Desde sus murallas, los visitantes disfrutan de unas vistas espectaculares del entorno natural, con el paisaje de olivares que caracteriza la región. Además, la alcazaba alberga el Centro de Interpretación del Patrimonio de la Alcazaba, donde se ofrecen exposiciones interactivas sobre la historia del lugar y la época medieval.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Palacio Abacial',
            'descripcionUno' => 'El Palacio Abacial de Alcalá la Real es un edificio renacentista que sirvió como residencia de los abades del Monasterio de San Blas. Fue construido a finales del siglo XVI y se caracteriza por su elegante fachada, adornada con elementos arquitectónicos del Renacimiento. El palacio tiene un patio central que evoca la grandiosidad de la época, y su interior alberga estancias que han sido restauradas para ofrecer una visión del estilo de vida de la nobleza religiosa de la época.',
            'descripcionDos' => 'Hoy en día, el Palacio Abacial es un centro cultural donde se celebran exposiciones temporales de arte, conciertos y eventos culturales. El edificio no solo es un atractivo para los amantes de la historia y la arquitectura, sino también para quienes disfrutan de la cultura contemporánea, ya que alberga actividades artísticas que complementan su riqueza histórica.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Mirador de San Marcos',
            'descripcionUno' => 'El Mirador de San Marcos es uno de los puntos más emblemáticos de Alcalá la Real, ofreciendo una vista panorámica impresionante de la ciudad y de la campiña jiennense. Desde este mirador, situado en la parte alta de la localidad, los visitantes pueden disfrutar de un paisaje que abarca los olivares que caracterizan la región, los montes cercanos, y el horizonte donde se encuentra la sierra de Parapanda. Además, es un lugar perfecto para apreciar la belleza del casco urbano de Alcalá la Real, con sus calles empedradas y sus edificaciones de gran valor histórico.',
            'descripcionDos' => 'Este mirador no solo es un lugar ideal para tomar fotografías, sino también para relajarse y disfrutar del entorno natural. En sus alrededores, se encuentran varios senderos que invitan a los turistas a explorar la ciudad y sus alrededores, lo que lo convierte en un lugar de interés tanto para los turistas como para los locales que buscan un momento de paz y tranquilidad.',
        ]);

        // Alcaudete
        LugarInteres::factory()->create([
            'nombre' => 'Castillo de Alcaudete',
            'descripcionUno' => 'El Castillo de Alcaudete es una fortaleza medieval que data del siglo XII, construida sobre un antiguo asentamiento romano. Durante la Edad Media, fue un importante bastión defensivo y un punto clave en la lucha entre musulmanes y cristianos. Tras la Reconquista, el castillo se convirtió en una residencia señorial y fue ampliado con una serie de torres y murallas que reforzaron su capacidad defensiva. Su estructura arquitectónica es un claro ejemplo de la transición entre la arquitectura militar islámica y la cristiana.',
            'descripcionDos' => 'El castillo ha sido restaurado y abierto al público como un lugar de interés turístico. Hoy en día, los visitantes pueden recorrer sus murallas, subir a las torres de vigilancia y disfrutar de vistas panorámicas de la comarca de Alcaudete. Además, el castillo alberga actividades culturales y recreativas, como representaciones históricas, lo que lo convierte en un lugar muy popular durante todo el año.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Iglesia de Santa Maria la Mayor',
            'descripcionUno' => 'La Iglesia de Santa María la Mayor de Alcaudete es uno de los principales monumentos religiosos de la localidad. Su construcción comenzó en el siglo XVI y fue erigida sobre una antigua iglesia medieval. El edificio, de estilo renacentista, destaca por su imponente fachada y su rica decoración interior, que incluye una serie de retablos barrocos y una magnífica torre campanario. La iglesia también alberga una valiosa colección de arte sacro y es un lugar de culto muy querido por los habitantes de Alcaudete.',
            'descripcionDos' => 'Además de su valor arquitectónico y artístico, la iglesia es un importante centro cultural y espiritual de la localidad. Durante todo el año, en su interior se celebran misas, conciertos y eventos religiosos que atraen tanto a locales como a turistas. La iglesia es, por lo tanto, una parada imprescindible para quienes desean conocer la historia religiosa y cultural de Alcaudete.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Fuente de la villa',
            'descripcionUno' => 'La Fuente de la Villa es uno de los lugares más pintorescos de Alcaudete, ubicada en el centro histórico del municipio. Esta fuente, que data del siglo XVIII, es famosa por su arquitectura barroca y por ser un punto de encuentro para los habitantes de la localidad. Su diseño incluye una serie de pilones y una estructura que la convierte en una de las fuentes más emblemáticas de la provincia de Jaén.',
            'descripcionDos' => 'La Fuente de la Villa no solo tiene un valor histórico y cultural, sino que también es un lugar de recreo y descanso para los visitantes. Los alrededores de la fuente están adornados con jardines y bancos, lo que permite disfrutar de una agradable estancia mientras se contempla la belleza del casco antiguo de Alcaudete.',

        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Plaza de Abastos',
            'descripcionUno' => 'La Plaza de Abastos de Alcaudete es un mercado tradicional que ofrece a los visitantes una auténtica experiencia de la vida local. En este mercado se venden productos frescos y artesanales, desde frutas y verduras hasta carnes y embutidos, muchos de los cuales provienen de la comarca de Alcaudete. La plaza, situada en el centro de la localidad, es también un espacio social y cultural donde los habitantes de la ciudad se reúnen a diario.',
            'descripcionDos' => 'La arquitectura de la Plaza de Abastos es sencilla pero pintoresca, con arcadas que rodean el espacio central y un ambiente vibrante que refleja la tradición de los mercados de pueblo. Además, la plaza se convierte en un lugar ideal para disfrutar de las costumbres locales, probar la gastronomía típica de la región y conocer a los habitantes de Alcaudete.',
        ]);

        // Catillo de Locubín
        LugarInteres::factory()->create([
            'nombre' => 'Castillo de la Villeta',     
            'descripcionUno' => 'El Castillo de la Villeta se encuentra en el municipio de La Villeta, en una colina que permite contemplar el hermoso paisaje de la comarca. Su origen se remonta al siglo XV, aunque se sabe que existía una fortificación anterior de tiempos musulmanes. A lo largo de la Edad Media, este castillo fue utilizado como defensa y residencia señorial.',
            'descripcionDos' => 'El castillo, aunque no está completamente restaurado, sigue siendo una visita interesante debido a su estratégica ubicación y su historia. Es ideal para los interesados en el turismo rural y cultural, ya que sus alrededores son perfectos para caminatas y exploraciones. En la actualidad, el castillo también se utiliza para eventos culturales y actividades al aire libre.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Iglesia de San Pedro',
            'descripcionUno' => 'La Iglesia de San Pedro es un templo religioso de gran belleza que destaca por su arquitectura renacentista. Fue construida en el siglo XVI y se encuentra en el centro del municipio. La iglesia alberga una importante colección de arte sacro, con varios retablos y una impresionante nave central. Además, su campanario se erige como uno de los puntos más altos de la localidad.',
            'descripcionDos' => 'La iglesia sigue siendo un lugar de culto activo y es también un punto turístico de interés para aquellos que desean conocer más sobre la historia religiosa de la región. Su fachada y su interior son ejemplos claros del arte religioso de la época, y su atmósfera serena la convierte en un lugar perfecto para la contemplación.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Puente Viejo',
            'descripcionUno' => 'El Puente Viejo es una construcción histórica que conecta diferentes partes del municipio a través del río. Este puente, que data de la época medieval, fue utilizado tanto para el tránsito de personas como para el paso de mercancías entre las localidades vecinas. Su estructura robusta y su antigüedad lo convierten en un símbolo de la importancia de los caminos en la época medieval.',
            'descripcionDos' => 'Hoy en día, Puente Viejo no solo es un punto de interés histórico, sino también un lugar para paseos tranquilos y momentos de reflexión. En los alrededores del puente, se pueden realizar rutas a pie o en bicicleta que permiten conocer mejor la zona y disfrutar de su entorno natural.',

        ]);

        // Frailes
        LugarInteres::factory()->create([
            'nombre' => 'Plaza de los Toros',
            'descripcionUno' => 'La Plaza de Toros de Frailes es un espacio tradicional que forma parte del patrimonio cultural de este municipio de la Sierra Sur de Jaén. Construida a mediados del siglo XX, refleja la profunda tradición taurina que ha estado presente en la cultura andaluza durante siglos. Aunque de dimensiones modestas en comparación con otras plazas del país, destaca por su ubicación en un entorno natural privilegiado y su integración en la vida social del pueblo.',
            'descripcionDos' => 'Este recinto ha sido escenario no solo de festejos taurinos, sino también de actividades culturales, conciertos y eventos populares que refuerzan su papel como centro de reunión vecinal. Durante las fiestas patronales, la plaza cobra especial protagonismo, convirtiéndose en uno de los lugares más animados del municipio. Su diseño sencillo y funcional conserva el encanto de las plazas de pueblos pequeños, donde la tradición taurina aún se vive con intensidad.
            Desde el punto de vista turístico, visitar la plaza permite al visitante comprender una parte importante del legado cultural de Frailes. Además, su cercanía al centro urbano la convierte en un buen punto de partida para recorrer el casco histórico y conocer otros aspectos del patrimonio local.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Bodegas  Campoameno',
            'descripcionUno' => 'Las Bodegas Campoameno son una referencia en la producción vinícola tradicional de la comarca. Situadas en un entorno montañoso, estas bodegas combinan métodos ancestrales con técnicas modernas para ofrecer vinos de gran calidad, muchos de ellos elaborados con variedades autóctonas. La tradición vinícola en Frailes se remonta a siglos atrás, y estas bodegas han contribuido a mantener vivo ese legado.',
            'descripcionDos' => 'Además de su producción, las Bodegas Campoameno ofrecen visitas guiadas donde los turistas pueden conocer el proceso de elaboración del vino, desde la vendimia hasta el embotellado, así como degustaciones acompañadas de productos locales. Estas experiencias no solo enriquecen el conocimiento sobre el vino, sino que también fortalecen el turismo enológico de la zona.
            Culturalmente, las bodegas actúan como difusoras de la identidad rural andaluza, mostrando cómo la agricultura y la gastronomía han sido pilares del desarrollo local. La visita a estas instalaciones permite entender cómo la viticultura ha moldeado el paisaje, la economía y las costumbres de Frailes a lo largo del tiempo.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Parque Periurbano de Los Llanos',
            'descripcionUno' => 'El Parque Periurbano de Los Llanos es un pulmón verde de gran valor ecológico y paisajístico situado en las inmediaciones del municipio de Frailes. Este espacio natural es ideal para el esparcimiento y el contacto con la naturaleza, contando con zonas de picnic, senderos señalizados y áreas de juego para niños. Su biodiversidad y tranquilidad lo convierten en un lugar perfecto para disfrutar en familia o realizar actividades al aire libre.
            Históricamente, esta zona ha sido utilizada para pastoreo y agricultura, y ha ido evolucionando hacia un modelo de conservación ambiental que promueve el turismo sostenible. En el parque se pueden observar especies vegetales autóctonas y una fauna característica de los montes mediterráneos, lo que lo convierte en un enclave atractivo para los amantes de la botánica y la ornitología.',
            'descripcionDos' => 'El parque también es un punto de partida habitual para rutas de senderismo que permiten explorar las sierras cercanas y conocer mejor la geografía de la Sierra Sur jiennense. Su accesibilidad y buena señalización hacen que sea un lugar frecuentado tanto por locales como por visitantes que buscan desconectar en un entorno natural privilegiado.',
        ]);

        // Valdepeñas de Jaén
        LugarInteres::factory()->create([
            'nombre' => 'Museo Molino de Santa Ana',
            'descripcionUno' => 'El Museo Molino de Santa Ana se ubica en un antiguo molino harinero rehabilitado, que permite al visitante conocer el proceso tradicional de molienda que fue fundamental para la economía rural andaluza durante siglos. El molino, de tipo hidráulico, funcionaba gracias a la fuerza del agua y es un ejemplo vivo de la ingeniería tradicional en entornos rurales. Fue restaurado y adaptado como museo para preservar este importante legado etnográfico.
            Durante la visita, se pueden observar las piedras de moler, las compuertas, el sistema de canales y otros elementos originales que permiten entender cómo se transformaba el trigo en harina. El museo también incluye una exposición con utensilios agrícolas y objetos de la vida cotidiana del campo jiennense, enriqueciendo la experiencia cultural del visitante.',
            'descripcionDos' => 'Este espacio no solo tiene un valor didáctico, sino también simbólico, ya que rescata la memoria del trabajo campesino y el modo de vida rural. Es un punto de gran interés para escuelas, familias y turistas interesados en la historia y la cultura tradicional andaluza.',

        ]);

        LugarInteres::factory()->create([
            'nombre' => 'La Pandera',          
            'descripcionUno' => 'La Pandera es una de las cumbres más altas de la provincia de Jaén, alcanzando los 1.872 metros sobre el nivel del mar. Ubicada en la Sierra Sur, su cima es conocida tanto por su impresionante panorámica como por haber sido meta de etapas en la Vuelta Ciclista a España. Su historia está marcada también por la presencia de una antigua base militar, hoy desmantelada, que se encontraba en su punto más alto.
            El área que rodea La Pandera es muy valorada por senderistas, ciclistas y amantes de la naturaleza. Sus rutas permiten descubrir una gran biodiversidad, con especies vegetales como el quejigo y el pino carrasco, así como fauna silvestre.',
            'descripcionDos' => ' Es habitual encontrar aficionados a la fotografía de paisajes, especialmente durante el amanecer o la puesta de sol, cuando las vistas son espectaculares.
            Además de su atractivo natural, La Pandera posee un importante valor cultural y simbólico para los habitantes de Valdepeñas de Jaén, quienes la consideran parte de su identidad territorial. También es un lugar de referencia para actividades deportivas y encuentros montañeros.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Mirador de Navalayegua',
            'descripcionUno' => 'El Mirador de Navalayegua es un balcón natural ubicado en las inmediaciones de Valdepeñas de Jaén, desde el cual se pueden contemplar unas vistas excepcionales del paisaje montañoso de la Sierra Sur. Rodeado de pinares y vegetación autóctona, este mirador es un lugar perfecto para quienes buscan tranquilidad y conexión con la naturaleza.',
            'descripcionDos' => 'Culturalmente, el mirador se ha convertido en un espacio de reflexión y disfrute paisajístico. Desde aquí se puede apreciar la disposición de los campos de cultivo, las montañas que envuelven al municipio, y en días despejados, incluso la silueta lejana de otras sierras andaluzas. Es un punto habitual de parada en rutas de senderismo y excursiones organizadas por asociaciones locales.
            Turísticamente, el Mirador de Navalayegua es un lugar muy valorado por los visitantes que desean conocer la riqueza natural de la provincia de Jaén sin realizar rutas exigentes. Dispone de bancos, paneles interpretativos y accesos adecuados, lo que lo convierte en un espacio ideal para el turismo familiar.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Iglesia de Santiago Apóstol',        
            'descripcionUno' => 'La Iglesia de Santiago Apóstol es el templo más importante de Valdepeñas de Jaén y un notable ejemplo de arquitectura religiosa barroca. Su construcción comenzó en el siglo XVIII, sobre los restos de una iglesia anterior, y fue finalizada en el siglo XIX. El edificio destaca por su imponente fachada de piedra, su torre campanario y sus proporciones armoniosas, que la convierten en un hito visual en el centro del municipio.
            En su interior, la iglesia alberga varios retablos barrocos y neoclásicos, así como una colección de imágenes religiosas de gran valor artístico y devocional. El altar mayor está dedicado a Santiago Apóstol, patrón del pueblo, cuya festividad se celebra con gran fervor cada 25 de julio, acompañada de procesiones y actos populares.',
            'descripcionDos' => 'La iglesia no solo es un centro de culto, sino también un lugar de gran importancia cultural para la comunidad. Ha sido testigo de acontecimientos clave en la historia local y sigue siendo un espacio central en la vida social y religiosa de Valdepeñas. Para los visitantes, representa una oportunidad para conocer el patrimonio artístico y espiritual de esta zona de Jaén.',
        ]);

        // Villacarrillo
        LugarInteres::factory()->create([
            'nombre' => 'El Aguardentero',
            'descripcionUno' => 'El Aguardentero es una figura emblemática en la historia de Villacarrillo, representando la tradición de la destilación de aguardiente en la región. Durante siglos, la producción de aguardiente fue una actividad económica significativa, y los aguardenteros eran conocidos por su habilidad en la destilación y su contribución a la economía local.',
            'descripcionDos' => '
            Culturalmente, el aguardiente no solo era una bebida alcohólica, sino también un elemento presente en celebraciones y rituales sociales. La figura del Aguardentero simboliza la conexión entre la tradición artesanal y la vida cotidiana de los habitantes de Villacarrillo.
            Turísticamente, el legado del Aguardentero se mantiene vivo a través de festivales y eventos que celebran esta tradición. Los visitantes pueden explorar la historia de la destilación en museos locales y participar en degustaciones que ofrecen una experiencia auténtica de la cultura de Villacarrillo.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Iglesia de Nuestra Señora de la Asunción',
            
            'descripcionUno' => 'La Iglesia de Nuestra Señora de la Asunción es un destacado ejemplo de arquitectura religiosa en Villacarrillo. Construida sobre la antigua parroquia de Santa María del Castillo, de estilo gótico, la actual iglesia presenta una planta rectangular con bóvedas vaídas y una sacristía terminada en torno al año 1618.',
            'descripcionDos' => 'En su interior, se pueden apreciar retablos que datan de los siglos XVII y XVIII, mostrando una estilística barroca y rococó. Estos elementos artísticos reflejan la riqueza cultural y la devoción religiosa de la comunidad local a lo largo de los siglos.
            La iglesia no solo es un lugar de culto, sino también un punto de interés turístico que atrae a visitantes interesados en la historia, el arte y la arquitectura religiosa de la región.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Cortijo Los Guerreros',
            'descripcionUno' => 'El Cortijo Los Guerreros es una finca histórica situada en las proximidades de Villacarrillo. Este cortijo ha sido testigo de la evolución agrícola y ganadera de la región, desempeñando un papel importante en la economía local.
            Culturalmente, los cortijos como Los Guerreros representan el modo de vida rural andaluz, donde las labores del campo y la vida familiar se entrelazaban en un entorno autosuficiente. Estos espacios eran centros de producción y también de transmisión de tradiciones y costumbres.',
            'descripcionDos' => 'Actualmente, el Cortijo Los Guerreros puede ser de interés para los visitantes que deseen conocer la historia rural de Jaén y experimentar la tranquilidad del campo andaluz. Algunos cortijos en la región han sido adaptados para el agroturismo, ofreciendo alojamiento y actividades relacionadas con la vida en el campo.',
        ]);
   
        LugarInteres::factory()->create([
            'nombre' => 'Cascada de la Osera',
            'descripcionUno' => 'La Cascada de la Osera, con una caída de 130 metros, es la más alta de Andalucía y se encuentra en el Parque Natural de las Sierras de Cazorla, Segura y Las Villas. Este impresionante salto de agua es un espectáculo natural que atrae a numerosos visitantes, especialmente durante la primavera, cuando el caudal es más abundante.',
            'descripcionDos' => 'El entorno de la cascada es ideal para los amantes del senderismo y la naturaleza. Existen rutas que permiten acceder a la cascada, ofreciendo vistas panorámicas y la oportunidad de disfrutar de la biodiversidad del parque natural.
Además de su belleza escénica, la Cascada de la Osera es un símbolo del patrimonio natural de la región y un ejemplo de los recursos hídricos que han sido fundamentales para las comunidades locales a lo largo de la historia.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Área recreativa de la Cueva del Peinero',
            'descripcionUno' => 'El Área Recreativa de la Cueva del Peinero está situada en la zona noroeste del Parque Natural de las Sierras de Cazorla, Segura y Las Villas, junto al río Aguascebas Grande. Este paraje escarpado ofrece un entorno natural de gran belleza, con vegetación de sauces, chopos y bojes.',
            'descripcionDos' => 'El área cuenta con instalaciones como merenderos de piedra y una fuente, lo que la convierte en un lugar ideal para el descanso y la recreación en plena naturaleza. Es un punto de partida para diversas rutas de senderismo que permiten explorar la riqueza ecológica de la zona.
La Cueva del Peinero es también un lugar de interés geológico, con formaciones que despiertan la curiosidad de los visitantes y ofrecen oportunidades para la educación ambiental y la observación de la fauna y flora locales.',
        ]);

        // Villanueva del arzobispo
        LugarInteres::factory()->create([
            'nombre' => 'Charco del Aceite',
            'descripcionUno' => 'El Charco del Aceite, también conocido como Charco de la Pringue, es una piscina natural formada por el antiguo cauce del río Guadalquivir, situada en plena Sierra de Segura y de Cazorla, a menos de 20 kilómetros de Villanueva del Arzobispo.',
            'descripcionDos' => 'Según la tradición, el nombre de este paraje se debe a que un burro, cargado con pellejos de aceite, se precipitó por un angosto camino, impregnando las aguas.
Este enclave es popular entre los visitantes por su belleza natural y las instalaciones que ofrece, como zonas de descanso, áreas para hacer barbacoas y un chiringuito. Es un lugar ideal para disfrutar de un día de ocio en contacto con la naturaleza.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Mirador Tapadero',
            'descripcionUno' => 'El Mirador El Tapadero se sitúa sobre el saliente de una pared rocosa, ofreciendo una impresionante panorámica de la Sierra de Las Villas. Desde este punto, se puede contemplar un mar de olivos y una caída vertical de más de 200 metros.',
            'descripcionDos' => 'Este mirador es un lugar privilegiado para la observación del paisaje y la fotografía, permitiendo apreciar la interacción entre la naturaleza y la actividad agrícola en la región.
Además, es un punto de interés para los senderistas y amantes de la naturaleza que buscan disfrutar de vistas espectaculares y la tranquilidad del entorno.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Caballo Torraso',
            'descripcionUno' => 'El Caballo Torraso es un cerro situado en la Sierra de Las Villas, dentro del Parque Natural de las Sierras de Cazorla, Segura y Las Villas, en la provincia de Jaén. Su altitud es de 1.726 metros sobre el nivel del mar.',
            'descripcionDos' => 'Desde su cima se dominan visualmente todas las direcciones, lo que ha favorecido la instalación de una caseta de vigilancia forestal. Es un punto estratégico para la prevención de incendios y la observación del entorno natural.
El Caballo Torraso es también un destino para los excursionistas y montañeros que buscan rutas de ascenso y la experiencia de alcanzar una de las cumbres más destacadas de la región.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Sendero del Guadalquivir',
            'descripcionUno' => 'El Sendero del Guadalquivir es una ruta que permite explorar el entorno natural de Villanueva del Arzobispo, siguiendo el curso del río Guadalquivir. Este sendero ofrece la oportunidad de disfrutar de paisajes variados, desde zonas de olivar hasta áreas boscosas y ribereñas.',
            'descripcionDos' => 'A lo largo del recorrido, los caminantes pueden observar la biodiversidad de la región, incluyendo diversas especies de flora y fauna. Es una ruta adecuada para diferentes niveles de habilidad y se puede realizar en familia.
El sendero también tiene un valor cultural, ya que permite conocer la relación histórica entre las comunidades locales y el río Guadalquivir, fuente de vida y desarrollo para la región.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Piscina natural de Mogón',
            'descripcionUno' => 'La piscina natural de Mogón, también conocida como la "playa de la sierra", se encuentra en el río Aguascebas, en el Parque Natural de las Sierras de Cazorla, Segura y Las Villas. Es una excelente área recreativa que ofrece un entorno natural para el baño y el descanso.',
            'descripcionDos' => 'Este paraje es popular entre los habitantes locales y los visitantes, especialmente durante los meses de verano, cuando se convierte en un lugar ideal para refrescarse y disfrutar de la naturaleza.
Además de la zona de baño, la piscina natural de Mogón cuenta con áreas de descanso y es un punto de partida para explorar otros atractivos naturales de la región.',
        ]);

        // Iznatoraf
        LugarInteres::factory()->create([
            'nombre' => 'Murallas y Torreón del Reloj',
            'descripcionUno' => 'Las murallas de Iznatoraf datan del periodo islámico, cuando la localidad era una importante plaza defensiva situada en un enclave estratégico entre las tierras altas de Segura y el valle del Guadalquivir. Estas murallas formaban parte del sistema defensivo de la ciudad y protegían el antiguo núcleo urbano. Aunque hoy en día solo se conservan algunos lienzos y estructuras, siguen siendo testimonio de su pasado medieval como bastión musulmán y, más tarde, como enclave cristiano tras la Reconquista.',
            'descripcionDos' => 'El Torreón del Reloj es uno de los elementos más característicos del conjunto defensivo. De origen medieval, se encuentra integrado en lo que fue una de las puertas de entrada al recinto amurallado. En el siglo XIX se le añadió un reloj, lo que convirtió a esta torre en un referente visual y simbólico del pueblo. Su campana marcaba las horas y era usada también para avisar de emergencias o celebraciones.
Turísticamente, las murallas y el torreón permiten hacer un viaje en el tiempo, con vistas panorámicas al entorno natural de la comarca. Pasear por los alrededores de estos restos históricos ofrece una experiencia evocadora y tranquila, ideal para los amantes de la historia y la fotografía, y permite comprender la importancia estratégica que Iznatoraf tuvo en épocas pasadas.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Iglesia de la Asunción',
            'descripcionUno' => 'La Iglesia de la Asunción es uno de los edificios más destacados de Iznatoraf y un símbolo de su patrimonio artístico. Su origen se remonta al siglo XVI, aunque presenta elementos arquitectónicos que abarcan varios estilos, principalmente el renacimiento y el barroco. Construida sobre una antigua mezquita, como era habitual tras la conquista cristiana, el templo destaca por su imponente presencia y su torre-campanario.',
            'descripcionDos' => 'El interior del templo alberga obras religiosas de valor artístico y espiritual, como retablos barrocos, imágenes procesionales y altares dedicados a diversos santos. El altar mayor, de gran belleza, está presidido por una talla de la Virgen de la Asunción, patrona de la localidad, cuya festividad se celebra con gran devoción en agosto. Durante esas fiestas, la iglesia se convierte en el centro de numerosas actividades religiosas y culturales.
Para los turistas, visitar la Iglesia de la Asunción supone un acercamiento a la historia religiosa de la comarca, además de una oportunidad para apreciar la arquitectura eclesiástica del Renacimiento andaluz. El templo se encuentra en pleno casco histórico, por lo que su visita puede integrarse en un recorrido por las calles empedradas y miradores del municipio.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Fuente del Alamillo',
            'descripcionUno' => 'La Fuente del Alamillo es una de las fuentes más emblemáticas de Iznatoraf, tanto por su valor histórico como por su ubicación en un entorno natural de gran belleza. Se cree que su origen podría estar vinculado a épocas medievales, cuando estas fuentes eran fundamentales para el abastecimiento de agua de la población. Situada a las afueras del núcleo urbano, ha sido durante siglos un lugar de reunión para los habitantes del pueblo y punto de paso para caminantes y pastores.',
            'descripcionDos' => 'La fuente se alimenta de un manantial natural y está rodeada de una vegetación que la convierte en un agradable rincón de sombra y frescor, especialmente en los meses de verano. Ha sido restaurada en varias ocasiones, respetando su estructura original, y forma parte de la red de fuentes históricas del municipio, junto con otras menores distribuidas por el término municipal.
Desde el punto de vista turístico y cultural, la Fuente del Alamillo se integra en diversas rutas de senderismo y paseos patrimoniales. Es un lugar ideal para descansar mientras se disfruta de la tranquilidad del paisaje y la conexión con el pasado rural de la zona. Representa además un símbolo del respeto por el agua como recurso vital en una región tradicionalmente agrícola.',
        ]);

        // Cazorla
        LugarInteres::factory()->create([
            'nombre' => 'Castillo de la Yedra',
            'descripcionUno' => 'El Castillo de la Yedra se erige sobre un promontorio rocoso desde el que se domina todo el paisaje circundante de Cazorla y su parque natural. De origen medieval, este castillo fue construido por los musulmanes en el siglo XI y posteriormente ampliado durante la Reconquista. El castillo fue testigo de numerosas batallas entre musulmanes y cristianos, y su ubicación estratégica le permitió defender la región de los ataques de los reinos vecinos.',
            'descripcionDos' => 'En su interior, el Castillo de la Yedra alberga el Museo de la Cultura del Olivo, lo que permite a los visitantes conocer el proceso histórico de la agricultura de olivo en la región, además de una rica exposición de la historia local y los usos del aceite de oliva. Su estructura, que aún conserva la torre del homenaje y parte de las murallas, se ha rehabilitado para poder ser visitada y es uno de los principales atractivos turísticos de Cazorla. Desde sus almenas, se puede disfrutar de unas vistas espectaculares de los alrededores, incluidos los imponentes picos montañosos del Parque Natural de las Sierras de Cazorla, Segura y Las Villas.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Ruinas de la Iglesia de Santa María de Gracia',
            'descripcionUno' => 'La Iglesia de Santa María de Gracia es uno de los ejemplos más significativos del patrimonio religioso de Cazorla. Fundada en el siglo XVI, esta iglesia fue construida en estilo renacentista sobre una estructura anterior que data del periodo islámico. El edificio sufrió grandes transformaciones a lo largo de los siglos, y, tras varios incendios y deterioros, hoy se conservan solo sus impresionantes ruinas, que evocan el esplendor del pasado.',
            'descripcionDos' => 'Las ruinas de la iglesia son uno de los puntos de interés más visitados de la ciudad, no solo por su valor histórico, sino también por la atmósfera que transmite. La fachada principal, con detalles arquitectónicos que aún sobreviven, es una de las imágenes más fotografiadas de Cazorla. Las ruinas están rodeadas por un entorno natural que invita a la reflexión y el paseo tranquilo, lo que convierte al sitio en una excelente parada tanto para los amantes de la historia como para quienes buscan un ambiente relajante en medio de la naturaleza.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Río Cerezuelo',
            'descripcionUno' => 'El Río Cerezuelo es uno de los principales afluentes del Guadalquivir y atraviesa el corazón de Cazorla, proporcionando un entorno natural excepcional tanto para los habitantes locales como para los turistas. Este río es especialmente conocido por la belleza de sus aguas cristalinas y el entorno verde que lo rodea, siendo un lugar ideal para paseos y actividades al aire libre. Su curso serpenteante crea hermosos paisajes, con saltos de agua y zonas donde el río forma pequeños estanques.',
            'descripcionDos' => 'El río es un punto clave para la biodiversidad en la zona, al albergar diversas especies acuáticas y vegetales propias del Parque Natural de las Sierras de Cazorla, Segura y Las Villas. El paseo junto al río, especialmente por el Parque de las Fuentes de Cazorla, es una de las rutas más agradables para conocer la ciudad y disfrutar de su entorno natural. Además, el Puente de las Herrerías sobre el Cerezuelo es otro de los puntos turísticos más populares, ofreciendo vistas panorámicas del paisaje.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Balcón de Zabaleta',
            'descripcionUno' => 'El Balcón de Zabaleta es uno de los miradores más espectaculares de la provincia de Jaén. Situado en las cercanías de Cazorla, este mirador ofrece una vista panorámica del impresionante paisaje montañoso del Parque Natural de las Sierras de Cazorla, Segura y Las Villas. Desde aquí se pueden observar vastas extensiones de bosques, picos rocosos y el serpenteante Río Guadalquivir. Su nombre proviene del pintor Pepe Zabaleta, que captó en sus cuadros la belleza de este paisaje.',
            'descripcionDos' => 'Este mirador es también un punto de referencia para el senderismo, ya que desde allí parten varias rutas que permiten adentrarse en el corazón de la naturaleza del parque. Es un lugar ideal para los aficionados a la fotografía, especialmente al amanecer o al atardecer, cuando la luz resalta las sombras y colores de la serranía. Además, en las inmediaciones del mirador se puede disfrutar de zonas de descanso, lo que lo convierte en un lugar perfecto para relajarse y contemplar la grandiosidad de la naturaleza.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Nacelrio',
            'descripcionUno' => 'Nacelrio es una de las áreas más representativas de los paisajes naturales de la Sierra de Cazorla. Este pequeño paraje, situado en las cercanías de la localidad de Cazorla, destaca por sus impresionantes panorámicas de los valles y montañas que lo rodean. Además de su belleza paisajística, Nacelrio es conocido por su rica biodiversidad y sus sendas naturales, ideales para el senderismo y la observación de fauna.',
            'descripcionDos' => 'A nivel cultural, Nacelrio es un lugar que simboliza la vida rural en la sierra. Antiguamente, fue una zona habitada por pastores y agricultores que aprovechaban sus recursos naturales para la subsistencia. Hoy en día, el área es un lugar popular para el ecoturismo, siendo visitado por aquellos que buscan una experiencia más cercana a la naturaleza y alejados de los núcleos urbanos. La cercanía al Parque Natural lo convierte en un excelente punto de partida para conocer otras zonas de Cazorla y disfrutar de la tranquilidad del entorno.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Fuente del Oso',
            'descripcionUno' => 'La Fuente del Oso es una de las fuentes más emblemáticas de Cazorla, conocida por su forma característica en la que el agua brota de una figura que representa a un oso, uno de los animales más representativos de la fauna local. Esta fuente es un símbolo de la fauna y naturaleza que rodea Cazorla, pues en el parque natural habitan diversas especies de osos y otros mamíferos.',
            'descripcionDos' => 'El lugar es muy popular entre los turistas que visitan Cazorla debido a su peculiaridad y belleza. Está situada cerca de rutas de senderismo y es un buen lugar para hacer una parada durante una caminata por el parque. Su cercanía a otros puntos de interés natural de la zona hace que sea una visita muy valorada por los excursionistas y amantes de la naturaleza.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Pico Poyos de la Mesa',
            'descripcionUno' => 'El Pico Poyos de la Mesa es uno de los picos más altos de la Sierra de Cazorla, con una altitud de 1.869 metros. Desde la cima se pueden obtener vistas impresionantes de la cordillera y del Parque Natural de las Sierras de Cazorla, Segura y Las Villas. Este pico es una de las rutas más exigentes y populares para los senderistas experimentados que buscan disfrutar de un paisaje montañoso en su forma más pura.',
            'descripcionDos' => 'A lo largo de la subida, los excursionistas pueden observar una variada flora y fauna, características de los ecosistemas de alta montaña. Además, la vista desde la cima permite una panorámica espectacular de los valles y montañas de la sierra, lo que lo convierte en un lugar muy apreciado por los amantes de la naturaleza y la fotografía.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Mirador del Chorro',
            'descripcionUno' => 'El Mirador del Chorro es uno de los puntos más espectaculares para observar el Parque Natural de las Sierras de Cazorla, Segura y Las Villas. Desde este mirador se pueden ver las aguas del Chorro de las Órdenes, una impresionante cascada que se desploma sobre un barranco rocoso, creando un entorno visual impresionante. El mirador se encuentra en un lugar de fácil acceso y es ideal para los turistas que desean disfrutar de una vista panorámica sin tener que realizar una caminata demasiado exigente.',
            'descripcionDos' => 'Este mirador se encuentra dentro de una de las rutas de senderismo más populares de la zona, y es un punto de paso para los que desean seguir explorando el parque natural. A su alrededor, la vegetación de ribera, las cascadas y el paisaje montañoso crean una atmósfera tranquila y relajante.',
        ]);

        // La Iruela
        LugarInteres::factory()->create([
            'nombre' => 'Castillo de la Iruela',
            'descripcionUno' => 'El Castillo de la Iruela es una fortaleza medieval que se sitúa en un promontorio rocoso en el Parque Natural de las Sierras de Cazorla, Segura y Las Villas. Su origen data del siglo XIII, en la época de la Reconquista, y fue construido por los musulmanes antes de ser tomado por los cristianos en el siglo XV. El castillo jugó un papel defensivo fundamental en la zona durante las luchas por el control de este estratégico territorio.',
            'descripcionDos' => 'Actualmente, el Castillo de la Iruela está parcialmente en ruinas, pero aún conserva elementos importantes como la torre del homenaje, las murallas y la puerta de acceso, lo que permite a los visitantes hacerse una idea de su grandeza original. El castillo ofrece vistas panorámicas espectaculares de La Iruela, el Parque Natural y la cercana Cazorla. El recorrido hasta la fortaleza es una excelente excursión para los amantes de la historia y el senderismo, permitiendo disfrutar de la naturaleza y de una vista privilegiada del entorno.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Ermita de la Virgen de la Cabeza',
            'descripcionUno' => 'La Ermita de la Virgen de la Cabeza es uno de los lugares más venerados de la región, especialmente entre los habitantes de La Iruela. Este santuario, que data del siglo XVIII, está dedicado a la Virgen de la Cabeza, patrona de la comarca de Cazorla. La ermita se encuentra en un entorno natural impresionante, rodeada de montañas y bosques, lo que hace de ella un lugar de peregrinaje y devoción popular.',
            'descripcionDos' => 'Además de su importancia religiosa, la ermita es un excelente punto de partida para realizar senderismo en el parque natural. Los caminos que llevan a ella atraviesan paisajes de gran belleza, y la subida es considerada una de las rutas más emblemáticas de la zona. Cada año, en el mes de abril, se celebran festividades en honor a la Virgen de la Cabeza, que atraen a numerosos visitantes y devotos a este pintoresco lugar.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Acebuches De Los Villares De Burunchel',
            'descripcionUno' => 'Los Acebuches de Los Villares de Burunchel son un conjunto de árboles milenarios que se encuentran en la zona de Burunchel, en la Iruela. Los acebuches, u olivos silvestres, son conocidos por su resistencia y longevidad. Estos ejemplares, algunos de los cuales tienen más de mil años de antigüedad, son un símbolo de la conexión entre el hombre y la naturaleza en esta región de Jaén.',
            'descripcionDos' => 'El área de los Acebuches es también un excelente lugar para realizar senderismo, ya que está rodeada por un entorno natural único, formado por bosques de pinos y encinas. El paisaje es muy pintoresco, y los visitantes pueden disfrutar no solo de la belleza de los árboles, sino también de la fauna local, como ciervos y aves rapaces. Este sitio también destaca por ser un lugar ideal para los amantes de la fotografía, especialmente en las primeras horas de la mañana, cuando la luz crea una atmósfera mágica.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Olivo Milenario',
            'descripcionUno' => 'El Olivo Milenario de La Iruela es un ejemplar de olivo que se encuentra en esta localidad y que, según se cree, tiene más de 1.500 años. Este olivo es uno de los más antiguos de Europa y simboliza la tradición agrícola de la comarca. En su tronco, que ha sobrevivido a los rigores del paso del tiempo, se pueden ver las huellas de su longevidad.',
            'descripcionDos' => 'Este olivo no solo es un símbolo cultural de la región, sino también un importante atractivo turístico, ya que está ubicado en una de las rutas senderistas más frecuentadas por los turistas. Además, los visitantes pueden disfrutar de un entorno natural lleno de historia, ya que el olivo es testigo de la vida rural de la zona a lo largo de los siglos. La cercanía al Parque Natural de las Sierras de Cazorla añade un valor adicional a este lugar, haciendo que sea un destino ideal para los amantes de la naturaleza y la historia.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Cascada de toba (Tobazo de Rechita)',
            'descripcionUno' => 'La Cascada de Toba, también conocida como Tobazo de Rechita, es una de las maravillas naturales del Parque Natural de las Sierras de Cazorla. Esta impresionante cascada, que se encuentra en un entorno montañoso y selvático, es el resultado del agua que cae de una gran roca, creando una caída de agua espectacular rodeada por un paisaje verde de bosque mediterráneo.',
            'descripcionDos' => 'El lugar es muy popular entre los excursionistas y fotógrafos, ya que ofrece una estampa única de la naturaleza. La ruta hasta la cascada es una de las más famosas en la zona, pasando por bellos paisajes y pequeñas charcas de agua. Además de ser un atractivo turístico, la cascada de Toba es también un excelente punto de observación de la fauna local, como las aves rapaces que habitan en la sierra.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'La Mocha',
            'descripcionUno' => 'La Mocha es un punto elevado en La Iruela desde el que se puede disfrutar de unas vistas impresionantes de la sierra de Cazorla. Esta área es conocida por su excelente panorámica, que permite ver la vastedad del Parque Natural de las Sierras de Cazorla, Segura y Las Villas. Además, es un lugar ideal para hacer senderismo y disfrutar de la flora y fauna que pueblan la zona.',
            'descripcionDos' => 'Desde La Mocha, los visitantes pueden ver el contraste entre los verdes valles y las rocas de la montaña, lo que convierte al lugar en un destino atractivo para los amantes de la naturaleza. Su ubicación estratégica la convierte en una parada indispensable para quienes buscan disfrutar de las vistas más espectaculares de la región.',
        ]);

        // Quesada
        LugarInteres::factory()->create([
            'nombre' => 'Calle Adentro',
            'descripcionUno' => 'La Calle Adentro es una de las calles más pintorescas y tradicionales de Quesada, que conserva el encanto de la arquitectura popular andaluza. Esta calle está llena de casas de estilo blanco, con balcones de hierro forjado, y serpentea por el casco antiguo del municipio, lo que le da un aire auténtico y tradicional.',
            'descripcionDos' => 'Recorrer la Calle Adentro es como viajar al pasado, ya que la calle es un reflejo de la historia de Quesada, con elementos arquitectónicos que datan de varios siglos atrás. Los turistas pueden disfrutar de sus rincones tranquilos, plazas acogedoras y, en ocasiones, de las fiestas populares que se celebran en la zona, lo que convierte a esta calle en un punto central de la vida cotidiana de la localidad.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Arco de la Manquita de Utrera',
            'descripcionUno' => 'El Arco de la Manquita de Utrera es uno de los monumentos más emblemáticos de Quesada, siendo una estructura que data de la Edad Media y que en su tiempo formaba parte de la antigua muralla que rodeaba la localidad. El arco, con su singular aspecto, destaca por la asimetría de su forma, lo que le ha dado su nombre popular. La leyenda cuenta que el arco se construyó con una parte incompleta debido a la falta de materiales o tiempo.',
            'descripcionDos' => 'Este monumento no sólo tiene valor histórico, sino que también es un punto de referencia para los turistas que exploran Quesada. Además, la zona alrededor del arco es un lugar ideal para paseos, donde los visitantes pueden disfrutar de las calles empedradas y las vistas de la sierra circundante.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Museo Zabaleta - Miguel Hernández',
            'descripcionUno' => 'El Museo Zabaleta - Miguel Hernández de Quesada es un espacio cultural que rinde homenaje a dos grandes figuras de la cultura española: el pintor Pepe Zabaleta y el poeta Miguel Hernández. Este museo alberga una rica colección de obras de Zabaleta, quien captó con su pincel los paisajes y la vida rural de la comarca, así como una exposición sobre la vida y obra de Miguel Hernández, quien estuvo muy vinculado a la región.',
            'descripcionDos' => 'El museo es un excelente lugar para los amantes del arte y la literatura, ya que ofrece una visión profunda de la tradición cultural de Quesada. Además de las exposiciones permanentes, el museo organiza actividades y eventos que permiten a los visitantes acercarse a la vida y el legado de ambos artistas. Es, sin duda, uno de los principales puntos de interés cultural de la localidad.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Cerro Vitar',
            'descripcionUno' => 'El Cerro Vitar es una de las elevaciones más destacadas de la comarca de Quesada, situada en el Parque Natural de las Sierras de Cazorla, Segura y Las Villas. Este cerro se caracteriza por sus impresionantes vistas panorámicas, desde donde los visitantes pueden contemplar la belleza natural del entorno, con montañas, valles y bosques. En la cima, el paisaje ofrece un espectáculo digno de ser fotografiado, especialmente al amanecer o al atardecer, cuando la luz transforma el paisaje en una obra de arte.',
            'descripcionDos' => 'El Cerro Vitar también es un lugar perfecto para el senderismo, con varias rutas que llevan hasta la cima, atravesando paisajes naturales que incluyen flora y fauna autóctonas. Además, el cerro tiene una gran importancia histórica, ya que desde sus alturas se podía vigilar la comarca, un punto estratégico utilizado por los habitantes antiguos para la defensa del territorio.',
        ]);

        // Peal de Becerro
        LugarInteres::factory()->create([
            'nombre' => 'Centro de Interpretación y Cámara Sepulcral de Toya',
            'descripcionUno' => 'El Centro de Interpretación y Cámara Sepulcral de Toya está ubicado en la localidad de Peal de Becerro, y es un sitio de gran valor arqueológico. En este centro se puede aprender sobre la historia antigua de la zona, especialmente de la cultura íbera, ya que la cámara sepulcral de Toya es uno de los hallazgos más importantes de la provincia de Jaén. La cámara sepulcral, que data del siglo IV a.C., es una construcción funeraria de origen íbero, que ofrece una visión fascinante de las prácticas funerarias de la época.',
            'descripcionDos' => 'El centro de interpretación permite a los visitantes comprender mejor el contexto histórico y cultural de este tipo de monumentos, y ofrece una experiencia educativa que ayuda a entender cómo vivían y se organizaban las comunidades íberas. Además, el lugar se encuentra en un entorno natural impresionante, lo que hace de la visita una experiencia completa tanto desde el punto de vista histórico como paisajístico.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Iglesia de Nuestra Señora de la Encarnación',
            'descripcionUno' => 'La Iglesia de Nuestra Señora de la Encarnación de Peal de Becerro es uno de los edificios religiosos más destacados de la localidad. Esta iglesia de origen renacentista fue construida en el siglo XVI y cuenta con una impresionante fachada y un interior lleno de detalles artísticos. Su estructura alberga una valiosa colección de arte sacro, destacando sobre todo la imagen de la Virgen de la Encarnación, que es la patrona del municipio.',
            'descripcionDos' => 'El templo ha sido restaurado en varias ocasiones, pero aún conserva su esencia original. Además, la iglesia está situada en el centro de Peal de Becerro, lo que la convierte en un punto de referencia tanto para los habitantes como para los turistas que exploran la zona. En sus cercanías, los visitantes pueden disfrutar de un paseo por las pintorescas calles del municipio, que conservan su carácter tradicional.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Castillo de Toya',
            'descripcionUno' => 'El Castillo de Toya se encuentra en las afueras de Peal de Becerro y es una de las estructuras medievales más interesantes de la comarca. Su origen se remonta al siglo XIII, cuando fue construido como fortaleza defensiva durante la época de la Reconquista. Aunque el castillo está en ruinas, todavía se pueden distinguir algunos de sus elementos más importantes, como la torre de vigilancia, las murallas y los cimientos de lo que una vez fue un imponente castillo.',
            'descripcionDos' => 'El Castillo de Toya tiene una ubicación estratégica sobre un cerro, desde donde se pueden contemplar unas vistas espectaculares de la comarca y los valles cercanos. Es un lugar ideal para los amantes de la historia y el senderismo, ya que la ruta que lleva hasta él permite disfrutar del paisaje natural de la zona. También es un lugar de interés para los que disfrutan de la fotografía, dado el ambiente medieval que aún conserva la fortaleza.',
        ]);

        // Chilluévar y Pozo Alcón
        LugarInteres::factory()->create([
            'nombre' => 'Cascada del Puente Nevada',
            'descripcionUno' => 'La Cascada del Puente Nevada, en Chilluévar y Pozo Alcón, es un espectacular salto de agua que se forma cuando el río Guadalquivir cruza la roca, creando una vista impresionante, especialmente en época de lluvias. Este rincón natural es perfecto para quienes buscan disfrutar de la belleza de la naturaleza en su estado más puro. La cascada está rodeada de un paisaje montañoso y boscoso, lo que convierte el lugar en un destino ideal para los amantes del ecoturismo.',
            'descripcionDos' => 'El entorno que rodea la cascada es propicio para realizar rutas de senderismo, y durante el recorrido, los visitantes pueden disfrutar del agua cristalina que se desliza por las rocas, creando un ambiente fresco y relajante. La cascada es uno de los atractivos naturales más visitados de la zona, y es común ver a turistas y locales disfrutar de un día de campo en sus alrededores.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Puente Viejo',
            'descripcionUno' => 'El Puente Viejo es otro de los emblemas históricos de Chilluévar y Pozo Alcón. Este puente de origen romano es conocido por su arquitectura singular y su ubicación sobre el cañón del río Guadalquivir. Durante siglos, el puente ha sido un paso vital para los habitantes de la región, conectando varias localidades y permitiendo el paso de mercancías y personas a través del cañón.',
            'descripcionDos' => 'El puente tiene un gran valor histórico, ya que es uno de los pocos ejemplos de la ingeniería romana conservados en la región. Aunque ha sido restaurado en varias ocasiones, mantiene gran parte de su estructura original, lo que lo convierte en un punto de interés tanto histórico como turístico. La vista desde el puente, que se asoma sobre el cañón, es impresionante, y es un lugar muy visitado por los turistas que desean disfrutar del paisaje natural.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Badlands del Guadiana Menor',
            'descripcionUno' => 'Los Badlands del Guadiana Menor son una formación geológica única en la provincia de Jaén. Se trata de un paisaje árido, donde las erosiones del viento y el agua han creado formaciones rocosas y cañones que parecen de otro planeta. Este tipo de paisaje es común en las zonas semiáridas y está lleno de colores y texturas que cambian según la luz del día, lo que lo convierte en un lugar muy fotogénico.',
            'descripcionDos' => 'Los badlands son una excelente oportunidad para el ecoturismo y el senderismo, ya que ofrecen rutas que permiten explorar el terreno mientras se aprende sobre los procesos geológicos que han formado esta curiosa estructura natural. Además, la fauna local, como aves rapaces y pequeños mamíferos, añade un toque especial a la experiencia.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Bosques Caducifolios de Alta Montaña',
            'descripcionUno' => 'Los Bosques Caducifolios de Alta Montaña de Chilluévar y Pozo Alcón son un espacio natural de gran riqueza biológica. Estos bosques, principalmente de encinas y robles, ofrecen un refugio tanto para la fauna local como para los visitantes que disfrutan de la naturaleza. En otoño, los colores de los árboles cambian, creando un paisaje vibrante que atrae a los turistas y fotógrafos de todo el mundo.',
            'descripcionDos' => 'El entorno forestal es ideal para realizar rutas de senderismo y paseos tranquilos en los que se puede disfrutar de la biodiversidad del parque natural. Además, los bosques se encuentran en una de las zonas más altas del parque, lo que proporciona unas vistas panorámicas excepcionales.',
        ]);

        LugarInteres::factory()->create([
            'nombre' => 'Cerrada la Bolera',
            'descripcionUno' => 'La Cerrada la Bolera es una de las formaciones geológicas más singulares de la zona. Se trata de una garganta natural formada por el río Guadalquivir, que ha esculpido el terreno a lo largo de los siglos, creando un paisaje espectacular. La cerrada está rodeada por paredes rocosas que se elevan dramáticamente sobre el río, lo que crea un ambiente impresionante.',
            'descripcionDos' => 'Este lugar es ideal para los amantes del senderismo y el rafting, ya que el río ofrece rutas de descenso emocionantes para los más aventureros. Además, la belleza del entorno convierte a Cerrada la Bolera en un destino turístico perfecto para aquellos que buscan una experiencia única en contacto con la naturaleza.',
        ]);
    }
}