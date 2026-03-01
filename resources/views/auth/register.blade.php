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
    @vite('resources/css/register.css')
</head>

<div class="container">
    <div class="row justify-content-center">
        <div class="col-md-8">
            <div class="formBox card">
                <div class="buttonsLoginRegister">
                    <a class="{{ Route::is('login') ? 'buttonsLoginRegisterStyle' : 'inputsLoginRegister' }} {{ Route::is('register') ? 'showDesktop' : 'showMobile' }}" href="{{ route('login') }}">Iniciar sesión</a>
                    <a class="{{ Route::is('register') ? 'buttonsLoginRegisterStyle' : 'inputsLoginRegister' }}" href="{{ route('register') }}">Regístrate</a>
                </div>

                <div class="card-body">

                    <form method="POST" action="{{ route('register') }}">
                        @csrf

                        <div class="ps-5 pe-5 mb-4">
                            <label for="name" class="inputName col-md-4 col-form-label {{ $isMobile ? 'ocultar' : '' }}">{{ __('Name') }}</label>

                            <div class="">
                                <input id="name" type="text" class="form-control @error('name') is-invalid @enderror" name="name" value="{{ old('name') }}" required autocomplete="name" placeholder="{{ $isMobile ? 'Name' : '' }}" autofocus>

                                @error('name')
                                    <span class="invalid-feedback" role="alert">
                                        <strong>{{ $message }}</strong>
                                    </span>
                                @enderror
                            </div>
                        </div>

                        <div class="ps-5 pe-5 mb-4">
                            <label for="email" class="inputName col-md-4 col-form-label {{ $isMobile ? 'ocultar' : '' }}">{{ __('Email Address') }}</label>

                            <div class="">
                                <input id="email" type="email" class="form-control @error('email') is-invalid @enderror" name="email" value="{{ old('email') }}" required autocomplete="email" placeholder="{{ $isMobile ? 'Email Address' : '' }}">

                                @error('email')
                                    <span class="invalid-feedback" role="alert">
                                        <strong>{{ $message }}</strong>
                                    </span>
                                @enderror
                            </div>
                        </div>

                        <div class="ps-5 pe-5 mb-4">
                            <label for="password" class="inputName col-md-4 col-form-label {{ $isMobile ? 'ocultar' : '' }}">{{ __('Password') }}</label>

                            <div class="">
                                <input id="password" type="password" class="form-control @error('password') is-invalid @enderror" name="password" required autocomplete="new-password" placeholder="{{ $isMobile ? 'Password' : '' }}">

                                @error('password')
                                    <span class="invalid-feedback" role="alert">
                                        <strong>{{ $message }}</strong>
                                    </span>
                                @enderror
                            </div>
                        </div>

                        <div class="ps-5 pe-5 mb-4">
                            <label for="password-confirm" class="inputName col-md-4 col-form-label {{ $isMobile ? 'ocultar' : '' }}">{{ __('Confirm Password') }}</label>

                            <div class="">
                                <input id="password-confirm" type="password" class="form-control" name="password_confirmation" required autocomplete="new-password" placeholder="{{ $isMobile ? 'Confirm Password' : '' }}">
                            </div>
                        </div>

                        <div class="">
                            <div class="registerButton">
                                <button type="submit" class="botonStyle mt-4">
                                    {{ __('Register') }}
                                </button>
                            </div>
                        </div>

                        <div class="haveAccount">
                            @if (Route::has('register'))
                            <a class="btn btn-link" href="{{ route('login') }}">
                                    {{ __('¿Ya tienes cuenta?') }} <span>Inicia Sesión</span>
                                </a>
                            @endif
                        </div>

                        
                    </form>

                </div>
            </div>
        </div>
    </div>
</div>
@endsection
