<head>
    <!-- css -->
    @vite('resources/css/nav.css')
</head>

<nav class="navbar">

    <a href="{{ url('/') }}" class="logo">
        <img class="logo" src="{{ asset('images/landingLogo.svg') }}" alt="Logo de OlivaTour">
    </a>

    <div id="hamburgerMenu" class="menu">
        <div id="navButtons" class="navButtons">
            @if (Route::has('login'))
                <div class="authentication">
                    @auth
                        <a class="enlace" href="{{ url('/biblioteca') }}" class="font-semibold text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white focus:outline focus:outline-2 focus:rounded-sm focus:outline-red-500">Biblioteca</a>
                        <form method="POST" action="{{ route('logout') }}">
                            @csrf
                            <button type="submit" class="enlace enlaceDestacado">Cerrar Sesión</button>
                        </form>
                        {{-- <a class="enlace" href="{{ url('/logout') }}" class="font-semibold text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white focus:outline focus:outline-2 focus:rounded-sm focus:outline-red-500">Cerrar Sesión</a> --}}
                    @else
                        <a class="enlace" href="{{ route('login') }}" class="font-semibold text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white focus:outline focus:outline-2 focus:rounded-sm focus:outline-red-500">Iniciar Sesión</a>
                        &nbsp;&nbsp;
                        @if (Route::has('register'))
                            <a class="enlace" href="{{ route('register') }}" class="ml-4 font-semibold text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white focus:outline focus:outline-2 focus:rounded-sm focus:outline-red-500">Registrarme</a>
                        @endif
                    @endauth
                </div>
            @endif
        </div>

        <div id="hamburgerLogoMenu" class="hamburgerMenu">
            <img id="hamburgerLogo" class="hamburgerLogo" src="{{ asset('images/hamburgerMenu.svg') }}" alt="logo hamburguesa">
        </div>
    </div>
</nav>

<script>
    const menu = document.getElementById('hamburgerMenu');
    const hamburgerLogoMenu = document.getElementById('hamburgerLogoMenu');
    const navButtons = document.getElementById('navButtons');
    const hamburguesa = document.getElementById('hamburgerLogo');
  
    hamburguesa.addEventListener('click', () => {
      menu.classList.toggle('open');
      hamburgerLogoMenu.classList.toggle('open');
      navButtons.classList.toggle('open');
    });
  </script>