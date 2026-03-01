@php
    use Detection\MobileDetect;

    $detect = new MobileDetect;
    $isMobile = $detect->isMobile();
    // $isMobile = true;
@endphp

<head>
    <!-- css -->
    @vite('resources/css/decorations.css')
</head>

<img class="left-blade {{ $isMobile ? 'showMobile' : 'showDesktop' }}" src="{{ asset('images/left.png') }}" alt="Hojas del logo de la izquierda">
<img class="right-blade {{ $isMobile ? 'showMobile' : 'showDesktop' }}" src="{{ asset('images/right.png') }}" alt="Hojas del logo de la derecha">
<img class="backgroundLogo {{ $isMobile ? 'showDesktop' : 'showMobile' }}" src="{{ asset('images/logo.png') }}" alt="Logo de fondo OlivaTour">

<div class="container d-flex justify-content-center">
    <h1 class="title"><a href="{{ url('/') }}">OlivaTour</a></h1>
</div>