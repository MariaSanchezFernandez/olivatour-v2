<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title>OlivaTour</title>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Urbanist:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">

        <!-- css -->
        @vite('resources/css/biblioteca.css')
    </head>
    <body class="antialiased">
        @include('nav')

        <div class="content">
            <div class="comarcas-container">
                <button class="comarca-btn active" data-comarca="campinaDeJaen">Campiña</button>
                <button class="comarca-btn" data-comarca="laLoma">La Loma</button>
                <button class="comarca-btn" data-comarca="lasVillas">Las Villas</button>
                <button class="comarca-btn" data-comarca="sierraMagina">Sierra Mágina</button>
                <button class="comarca-btn" data-comarca="sierraSur">Sierra Sur</button>
                <button class="comarca-btn" data-comarca="sierraDeSegura">Sierra Segura</button>
                <button class="comarca-btn" data-comarca="condadoDeJaen">El Condado</button>
                <button class="comarca-btn" data-comarca="comarcaDeJaen">Jaén</button>
                <button class="comarca-btn" data-comarca="sierraDeCazorla">Sierra Cazorla</button>
                <button class="comarca-btn" data-comarca="sierraMorena">Sierra Morena</button>
            </div>

            <div id="comarca-content" class="comarca-content">
                <div class="comarca-imagen-container">
                    <img id="comarca-imagen" class="comarca-imagen" style="display: none;">
                    <div class="comarca-imagen-overlay"></div>
                </div>
            
                <div class="left-section">
                    <div id="comarca-info-principal" class="comarca-info-principal">
                        {{-- JS llenará esto:<h2 class="comarca-nombre"></h2> <span class="porcentaje"></span> --}}
                    </div>
                </div>
            
                <div class="right-section"> {{-- ID "poblaciones-container" eliminado de aquí para simplificar, el título y la lista son suficientes --}}
                    <h3 id="poblaciones-titulo">Poblaciones</h3>
                    <div id="poblaciones-list" class="poblaciones-list">
                        {{-- Las tarjetas de población se generan aquí por JS --}}
                    </div>
                </div>
            </div>
        </div>

        <script>
            document.addEventListener('DOMContentLoaded', function() {
                const buttons = document.querySelectorAll('.comarca-btn');
                const comarcaImagenElement = document.getElementById('comarca-imagen');
                const comarcaInfoPrincipalContainer = document.getElementById('comarca-info-principal');
                const poblacionesListElement = document.getElementById('poblaciones-list');
                const poblacionesTituloElement = document.getElementById('poblaciones-titulo');


                // Asegúrate que estos objetos están definidos y son correctos,
                // como estaban en tu script original. Son cruciales.
                const imagePaths = {
                    'campinaDeJaen': 'campiña.webp',
                    'laLoma': 'loma.jpg',
                    'lasVillas': 'LasVillas.jpg',
                    'sierraMagina': 'sierraMagina.JPG',
                    'sierraSur': 'SierraSur.jpg',
                    'sierraDeSegura': 'SierraSegura.jpg',
                    'condadoDeJaen': 'condad.jpg',
                    'comarcaDeJaen': 'jaen.jpg',
                    'sierraDeCazorla': 'Cazorla.jpg',
                    'sierraMorena': 'sierraMorena.jpg'
                };

                const comarcasId = {
                    'campinaDeJaen': 1,
                    'condadoDeJaen': 2,
                    'sierraMorena': 3,
                    'comarcaDeJaen': 4,
                    'laLoma': 5,
                    'lasVillas': 6,
                    'sierraDeCazorla': 7,
                    'sierraDeSegura': 8,
                    'sierraMagina': 9,
                    'sierraSur': 10
                };

                // Crear elementos para la info de la comarca si no existen o seleccionarlos
                let medallaElement = comarcaInfoPrincipalContainer.querySelector('.medalla-img');
                if (!medallaElement) {
                    medallaElement = document.createElement('img');
                    medallaElement.className = 'medalla-img';
                    medallaElement.alt = 'Medalla';
                    comarcaInfoPrincipalContainer.appendChild(medallaElement);
                }

                let nombreComarcaElement = comarcaInfoPrincipalContainer.querySelector('.comarca-nombre');
                if (!nombreComarcaElement) {
                    nombreComarcaElement = document.createElement('h2');
                    nombreComarcaElement.className = 'comarca-nombre';
                    comarcaInfoPrincipalContainer.appendChild(nombreComarcaElement);
                }

                let porcentajeElement = comarcaInfoPrincipalContainer.querySelector('.porcentaje');
                if (!porcentajeElement) {
                    porcentajeElement = document.createElement('span');
                    porcentajeElement.className = 'porcentaje';
                    comarcaInfoPrincipalContainer.appendChild(porcentajeElement);
                }
                // Asegurar el orden correcto si se crean dinámicamente
                comarcaInfoPrincipalContainer.insertBefore(medallaElement, nombreComarcaElement);
                comarcaInfoPrincipalContainer.appendChild(porcentajeElement);


                async function cargarPoblaciones(comarcaDataSetValue) {
                    if (!poblacionesListElement) {
                        console.error("Elemento #poblaciones-list no encontrado.");
                        poblacionesTituloElement.style.display = 'none';
                        return;
                    }
                    poblacionesListElement.innerHTML = '<p>Cargando poblaciones...</p>'; // Feedback para el usuario

                    const numericId = comarcasId[comarcaDataSetValue];
                    if (numericId === undefined) {
                        console.error(`ID numérico no encontrado para la comarca: ${comarcaDataSetValue}`);
                        poblacionesListElement.innerHTML = '<p>Información de comarca no disponible.</p>';
                        poblacionesTituloElement.style.display = 'block'; // Mostrar título aunque no haya lista
                        return;
                    }

                    try {
                        const response = await fetch(`/api/comarcas/${numericId}/poblaciones`);
                        if (!response.ok) {
                            const errorText = await response.text();
                            console.error(`Error en fetch de poblaciones: ${response.status} ${response.statusText}`, errorText);
                            throw new Error(`Error al obtener las poblaciones (${response.status})`);
                        }
                        const poblaciones = await response.json();
                        
                        poblacionesListElement.innerHTML = ''; // Limpiar antes de añadir nuevas

                        if (!poblaciones || poblaciones.length === 0) {
                            poblacionesListElement.innerHTML = '<p>No hay poblaciones para mostrar en esta comarca.</p>';
                            poblacionesTituloElement.style.display = 'block';
                            return;
                        }
                        
                        poblacionesTituloElement.style.display = 'block';

                        for (const poblacion of poblaciones) {
                            if (!poblacion || typeof poblacion.id === 'undefined') {
                                console.warn("[cargarPoblaciones] Población con ID faltante omitida:", poblacion);
                                continue; 
                            }

                            const divCard = document.createElement('div');
                            divCard.className = 'poblacion-card'; // Esta es la tarjeta que contiene solo la imagen

                            const imgPoblacion = document.createElement('img');
                            imgPoblacion.className = 'imagen-poblacion';
                            imgPoblacion.alt = poblacion.nombre ? `Imagen de ${poblacion.nombre}` : 'Imagen de población'; 
                            
                            imgPoblacion.src = poblacion.ruta_imagen || `/api/poblaciones/${poblacion.id}/imagen`;
                            imgPoblacion.onerror = () => {
                                console.warn(`[cargarPoblaciones] Error al cargar imagen: ${imgPoblacion.src}. Usando default.`);
                                imgPoblacion.src = '/images/default-poblacion.png';
                            };

                            // Solo añadimos la imagen de la población a la tarjeta.
                            // No se crea ni se añade ningún elemento para el escudo.
                            divCard.appendChild(imgPoblacion);
                            
                            poblacionesListElement.appendChild(divCard);
                        }
                    } catch (error) {
                        console.error("Error detallado al cargar poblaciones:", error);
                        poblacionesListElement.innerHTML = '<p>Error al cargar las poblaciones. Intente de nuevo.</p>';
                        poblacionesTituloElement.style.display = 'block';
                    }
                }

                buttons.forEach(button => {
                    button.addEventListener('click', function() {
                        buttons.forEach(btn => btn.classList.remove('active'));
                        this.classList.add('active');

                        const comarcaDataSetValue = this.dataset.comarca;
                        const comarcaNombreVisible = this.textContent;

                        // Actualizar imagen de fondo de la comarca
                        if (imagePaths && imagePaths[comarcaDataSetValue]) {
                            comarcaImagenElement.src = `/images/comarcasImagenFondo/${imagePaths[comarcaDataSetValue]}`;
                            comarcaImagenElement.style.display = 'block';
                        } else {
                            console.warn(`Ruta de imagen de fondo no encontrada para: ${comarcaDataSetValue}`);
                            comarcaImagenElement.style.display = 'none';
                        }

                        // Actualizar info principal de la comarca (nombre, medalla, porcentaje)
                        if (nombreComarcaElement) {
                            nombreComarcaElement.textContent = comarcaNombreVisible;
                        }
                        if (medallaElement) {
                            // Lógica para la medalla (ej. si la ruta depende del nombre de la comarca)
                            // Esto es un ejemplo, ajusta la ruta a tu estructura de archivos de medallas
                            const rutaMedalla = `/images/medallas/comarcas/${comarcaDataSetValue}.svg`; // Asumiendo nombres como "sierraMorena.svg"
                            medallaElement.src = rutaMedalla;
                            medallaElement.onerror = () => { medallaElement.src = '/images/medalla.png'; }; // Fallback
                        }
                        if (porcentajeElement) {
                            // Lógica para el porcentaje (si es dinámico)
                            porcentajeElement.textContent = '10%'; // Ejemplo, actualiza si tienes datos reales
                        }
                        
                        comarcaInfoPrincipalContainer.style.display = 'flex'; // Asegurar que sea visible

                        cargarPoblaciones(comarcaDataSetValue);
                    });
                });

                // Carga inicial de la primera comarca o una por defecto
                const comarcaInicialDataSetValue = 'sierraMorena'; // Puedes cambiar esto a 'campinaDeJaen' o la que prefieras
                const botonInicial = document.querySelector(`.comarca-btn[data-comarca="${comarcaInicialDataSetValue}"]`);
            
                if (botonInicial) {
                    botonInicial.click(); // Simula un clic para cargar la comarca inicial
                } else {
                    const primerBoton = document.querySelector('.comarca-btn');
                    if (primerBoton) {
                        primerBoton.click(); // Intenta con el primero si el por defecto no se encuentra
                    } else {
                        console.error("No se encontraron botones de comarca para la carga inicial.");
                        if(poblacionesListElement) poblacionesListElement.innerHTML = '<p>Seleccione una comarca.</p>';
                        if(poblacionesTituloElement) poblacionesTituloElement.style.display = 'none';
                        if(comarcaInfoPrincipalContainer) comarcaInfoPrincipalContainer.style.display = 'none';

                    }
                }
            });
        </script>
    </body>
</html>