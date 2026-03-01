<?php

/*
 * script para obtener imágenes de google place api
 */

$url = 'https://maps.googleapis.com/maps/api/place/textsearch/json';

$localidades = [
    'Hornos', 'La Puerta de Segura', 'Orcera',
    'Jaén', 'Puente del Obispo', 'Iznatoraf',
    'Villanueva del Arzobispo', 'Beas de Segura', 'Puente de Génave',
    'Peal de Becerro', 'Los Villares', 'Cabra del Santo Cristo',
    'Santiago de la Espada', 'Mengíbar', 'Fuerte del Rey',
    'Aldeaquemada', 'Vilches', 'Arquillos',
    'Navas de San Juan', 'Castellar', 'Santisteban del Puerto',
    'Siles', 'Santa Elena', 'Bélmez de la Moraleda',
    'Cambil', 'Torres', 'Higuera de Calatrava',
    'Lopera', 'Jimena', 'Carboneros',
    'La Iruela', 'Torreblascopedro', 'Ibros',
    'Begíjar', 'Canena', 'Rus',
    'Baños de la Encina', 'Guarromán', 'Arjonilla',
    'Sabiote', 'Chiclana de Segura', 'Villarrodrigo',
    'Génave', 'Benatae', 'Torres de Albánchez',
    'Arroyo del Ojanco', 'Segura de la Sierra', 'Santo Tomé',
    'Bedmar', 'Albanchez de Mágina', 'Chilluévar',
    'Larva', 'Huesa', 'Hinojares',
    'Carchelejo', 'Frailes', 'Castillo de Locubín',
    'Fuensanta de Martos', 'Valdepeñas de Jaén', 'Monte Lope Álvarez',
    'Noguerones', 'Santiago de Calatrava', 'Pegalajar',
    'La Guardia de Jaén', 'Escañuela', 'Villargordo',
    'Villanueva de la Reina', 'Cazalilla', 'Villardompardo',
    'Lahiguera', 'Espeluy', 'Arjona',
    'Campillo de Arenas', 'Jabalquinto', 'Jamilena',
    'Sorihuela del Guadalimar', 'Alcalá la Real', 'Alcaudete',
    'Andújar', 'Baeza', 'Bailén',
    'Cazorla', 'Jódar', 'La Carolina',
    'Linares', 'Mancha Real', 'Martos',
    'Porcuna', 'Pozo Alcón', 'Torredelcampo',
    'Torredonjimeno', 'Villacarrillo', 'Quesada',
    'La Matea', 'Lupión', 'Úbeda',
    'Torreperogil', 'Montizón', 'Huelma',
    'Noalejo', 'Estación Linares-Baeza',
    'Marmolejo'
];

$localidadesFormateadas = [];

$responseData = [];

foreach ($localidades as $key => $localidad) {
    $reemplazos = [
        ' ' => '+',
        'ñ' => 'n',
        'Á' => 'A',
        'É' => 'E',
        'Í' => 'I',
        'Ó' => 'O',
        'Ú' => 'U',
        'á' => 'a',
        'é' => 'e',
        'í' => 'i',
        'ó' => 'o',
        'ú' => 'u',
        // '' => '',
    ];
    
    $municipio = strtr($localidad, $reemplazos);
    echo $localidad . ' -> ' . $municipio . PHP_EOL;
    $localidadesFormateadas[$key] = $municipio;
}

foreach ($localidadesFormateadas as $key => $localidad) {
    $request_url = $url . '?query=' . $localidad . '&type=locality&key=AIzaSyDBjy-b0qqYfLZ6ksRVwHidicfddzrhtDk';

    $curl = curl_init($request_url);
    
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($curl, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json'
    ]);
    
    $response = curl_exec($curl);
    
    curl_close($curl);

    $responseData[$localidad] = json_decode($response, true);

    echo $response . PHP_EOL;
}

file_put_contents('localidades.json', json_encode($responseData, JSON_PRETTY_PRINT));