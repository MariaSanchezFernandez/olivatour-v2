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
        @vite('resources/css/landing.css')
    </head>
    <body class="antialiased">
        @include('nav')

        <div class="landingContent">
            <section class="inicio">
                <div class="conocesJaen">
                    <h1>¿Crees que conoces la provincia de Jaén a fondo?</h1>
                    
                    <img src="{{ asset('images/provincia.svg') }}" alt="Imagen de la silueta de la provincia de Jaén">

                    <p>Te invitamos a descubrirla de una forma totalmente nueva</p>
                    <a href="{{ route('register') }}" class="btn btn-primary descargar">Descargar</a>
                </div>

                <img src="{{ asset('images/provincia.svg') }}" alt="Imagen de la silueta de la provincia de Jaén">
            </section>

            <section class="objetivo">
                {{-- <img class="objetivoBackground" src="{{ asset('images/backgroundLogo.svg') }}" alt="Logo de fondo de OlivaTour"> --}}

                <div class="objetivoContent">
                    <h2>¿Objetivo?</h2>
                    <p>Completar todas las comarcas</p>

                    <div class="comarcasBox">
                        <div class="objetivoComarcas objetivoComarcasPadding">
                            <img class="comarca" src="{{ asset('images/medallas/comarcas/sierraMorena.svg') }}" alt="Medalla del logro de Sierra Morena">
                            <img class="comarca" src="{{ asset('images/medallas/comarcas/sierraSegura.svg') }}" alt="Medalla del logro de Sierra Segura">
                            <img class="" src="{{ asset('images/medallas/comarcas/jaen.svg') }}" alt="Medalla del logro de Jaén">
                        </div>
        
                        <div class="objetivoComarcas objetivoComarcasCentro">
                            <img class="comarca" src="{{ asset('images/medallas/comarcas/campiña.svg') }}" alt="Medalla del logro de Campiña">
                            <img class="comarca" src="{{ asset('images/medallas/comarcas/sierraCazorla.svg') }}" alt="Medalla del logro de Sierra de Cazorla">
                            <img class="comarca" src="{{ asset('images/medallas/comarcas/sierraSur.svg') }}" alt="Medalla del logro de Sierra Sur">
                            <img class="" src="{{ asset('images/medallas/comarcas/sierraMagina.svg') }}" alt="Medalla del logro de Sierra de Mágina">
                        </div>
        
                        <div class="objetivoComarcas objetivoComarcasPadding">
                            <img class="comarca" src="{{ asset('images/medallas/comarcas/elCondado.svg') }}" alt="Medalla del logro de El Condado">
                            <img class="comarca" src="{{ asset('images/medallas/comarcas/lasVillas.svg') }}" alt="Medalla del logro de Las Villas">
                            <img class="" src="{{ asset('images/medallas/comarcas/laLoma.svg') }}" alt="Medalla del logro de La Loma">
                        </div>
                    </div>

                    <div class="comarcasBoxResponsive">
                        <div class="objetivoComarcas objetivoComarcasPadding">
                            <img class="comarca" src="{{ asset('images/medallas/comarcas/campiña.svg') }}" alt="Medalla del logro de Campiña">
                            <img class="comarca" src="{{ asset('images/medallas/comarcas/sierraCazorla.svg') }}" alt="Medalla del logro de Sierra de Cazorla">
                            <img class="comarca" src="{{ asset('images/medallas/comarcas/sierraSur.svg') }}" alt="Medalla del logro de Sierra Sur">
                            <img class="" src="{{ asset('images/medallas/comarcas/sierraMagina.svg') }}" alt="Medalla del logro de Sierra de Mágina">
                        </div>
        
                        <div class="objetivoComarcas objetivoComarcasCentro">
                            <img class="comarca" src="{{ asset('images/medallas/comarcas/sierraMorena.svg') }}" alt="Medalla del logro de Sierra Morena">
                            <img class="comarca" src="{{ asset('images/medallas/comarcas/sierraSegura.svg') }}" alt="Medalla del logro de Sierra Segura">
                            <img class="" src="{{ asset('images/medallas/comarcas/jaen.svg') }}" alt="Medalla del logro de Jaén">
                        </div>
        
                        <div class="objetivoComarcas objetivoComarcasPadding">
                            <img class="comarca" src="{{ asset('images/medallas/comarcas/elCondado.svg') }}" alt="Medalla del logro de El Condado">
                            <img class="comarca" src="{{ asset('images/medallas/comarcas/lasVillas.svg') }}" alt="Medalla del logro de Las Villas">
                            <img class="" src="{{ asset('images/medallas/comarcas/laLoma.svg') }}" alt="Medalla del logro de La Loma">
                        </div>
                    </div>
                </div>
            </section>

            <section class="comarcas">

                <div class="comarcasContent">
                    <h2>Cada comarca contiene varios pueblos</h2>
                    <p>Y cada pueblo hasta <span class="">8 logros</span> diferentes</p>
                    
                    <div class="monedas">
                        <img class="monedasPaddingRight monedasPaddingBottom " src="{{ asset('images/medallas/monedas/monumento.svg') }}" alt="Moneda de monumentos">
                        <img class="monedasPaddingRight monedasResponsive" src="{{ asset('images/medallas/monedas/castillo.svg') }}" alt="Moneda de castillos">
                        <img class="monedasPaddingRight" src="{{ asset('images/medallas/monedas/paisaje.svg') }}" alt="Moneda de paisajes">
                        <img class="monedasResponsive" src="{{ asset('images/medallas/monedas/cultura.svg') }}" alt="Moneda de cultura">
                        <img class="monedasPaddingRight monedasResponsive" src="{{ asset('images/medallas/monedas/calles.svg') }}" alt="Moneda de calles">
                        <img class="monedasPaddingRight monedasResponsive" src="{{ asset('images/medallas/monedas/iglesia.svg') }}" alt="Moneda de iglesias">
                        <img class="monedasPaddingRight monedasResponsive" src="{{ asset('images/medallas/monedas/historia.svg') }}" alt="Moneda de historia">
                        <img class="" src="{{ asset('images/medallas/monedas/otros.svg') }}" alt="Moneda de otros">
                    </div>
                </div>

                <div class="medallas">
                    <img class="" src="{{ asset('images/medallas/aldeaQuemadaSantaElena.svg') }}" alt="Medalla del logro de Sierra Sur">
                    <img class="" src="{{ asset('images/medallas/bailén.svg') }}" alt="Medalla del logro de Sierra Sur">
                    <img class="" src="{{ asset('images/medallas/bañosDeLaEncina.svg') }}" alt="Medalla del logro de Sierra Sur">
                    <img class="" src="{{ asset('images/medallas/linares.svg') }}" alt="Medalla del logro de Sierra Sur">
                </div>
            </section>

            <section class="mensaje">
                <h2>Explora la provincia completando el mapa en cada viaje que hagas</h2>
            </section>

            <section class="movil">
                <img class="" src="{{ asset('images/phone.png') }}" alt="Imagen de un móvil en el inicio de sesión de OlivaTour">

                <div class="movilContent">
                    <h2>Descubre todo el potencial que guarda Jaén</h2>
                    <a href="{{ route('register') }}" class="btn btn-primary descargar">Descargar</a>
                </div>
            </section>

            <section class="ranking">
                <h2>Y comprueba quienes son los mejores</h2>
            </section>
        </div>

    </body>
</html>