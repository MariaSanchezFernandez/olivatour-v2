@extends('layouts.app')

@php
    use Detection\MobileDetect;

    $detect = new MobileDetect;
    $isMobile = $detect->isMobile();
    // $isMobile = true;
@endphp

@section('content')
@include('decorations') {{-- título e imágenes --}}

<head>
    <!-- css -->
    @vite('resources/css/login.css')
</head>

<div class="container">
    <div class="row justify-content-center">
        {{-- <div class="container d-flex justify-content-center">
            <h1 class="title">OlivaTour</h1>
        </div> --}}
        
        <div class="col-md-8">
            <div class="formBox card">
                {{-- <div class="card-header">{{ __('Iniciar Sesión') }}</div> --}}

                    <div class="buttonsLoginRegister">
                        <a class="{{ Route::is('login') ? 'buttonsLoginRegisterStyle' : 'inputsLoginRegister' }}" href="{{ route('login') }}">Iniciar sesión</a>
                        <a class="{{ Route::is('register') ? 'buttonsLoginRegisterStyle' : 'inputsLoginRegister' }} showDesktop" href="{{ route('register') }}">Regístrate</a>
                    </div>

                    <div class="card-body">

                        <form method="POST" action="{{ route('login') }}">
                            @csrf
    
                            <div class="ps-5 pe-5 mb-4">
                                <label for="email" class="inputName pb-2 {{ $isMobile ? 'ocultar' : '' }}">{{ __('Email Address') }}</label>
    
                                <div class="">
                                    <input id="email" type="email" class="form-control @error('email') is-invalid @enderror" name="email" value="{{ old('email') }}" required autocomplete="email" placeholder="{{ $isMobile ? 'Email' : '' }}" autofocus>

                                    @error('email')
                                        <span class="invalid-feedback" role="alert">
                                            <strong>{{ $message }}</strong>
                                        </span>
                                    @enderror
                                </div>
                            </div>
    
                            <div class="ps-5 pe-5">
                                <label for="password" class="inputName pb-2 {{ $isMobile ? 'ocultar' : '' }}">{{ __('Password') }}</label>
    
                                <div class="">
                                    <input id="password" type="password" class="form-control @error('password') is-invalid @enderror" name="password" required autocomplete="current-password" placeholder="{{ $isMobile ? 'Contraseña' : '' }}">
    
                                    @error('password')
                                        <span class="invalid-feedback" role="alert">
                                            <strong>{{ $message }}</strong>
                                        </span>
                                    @enderror
                                </div>
                            </div>
    
                            <div class="row mb-3 ps-5 pe-5">
                                <div class="col-md-6">
                                    <div class="checkBox form-check">
                                        <input class="form-check-input" type="checkbox" name="remember" id="remember" {{ old('remember') ? 'checked' : '' }}>
    
                                        <label class="form-check-label" for="remember">
                                            {{ __('Remember Me') }}
                                        </label>
                                    </div>
                                </div>
                            </div>
    
                            <div class="loginButton">
                                <button type="submit" class="botonStyle">
                                    {{ __('Iniciar Sesión') }}
                                </button>
                            </div>

                            <div class="forgotPassword">
                                @if (Route::has('password.request'))
                                    <a class="btn btn-link" href="{{ route('password.request') }}">
                                        {{ __('¿Olvidaste la contraseña?') }}
                                    </a>
                                @endif
                            </div>

                            <div class="registerMobile showMobile">
                                @if (Route::has('register'))
                                    <a class="btn btn-link" href="{{ route('register') }}">
                                        {{ __('¿No tienes cuenta?') }} <span>Regístrate</span>
                                    </a>
                                @endif
                            </div>
                        </form>

                    </div>
                {{-- </div> --}}
            </div>
        </div>
    </div>
</div>

@endsection