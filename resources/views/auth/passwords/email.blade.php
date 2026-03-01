@extends('layouts.app')

@php
    use Detection\MobileDetect;

    $detect = new MobileDetect;
    $isMobile = $detect->isMobile();
    // $isMobile = true;
@endphp

@section('content')
@include('decorations')

<head>
    <!-- css -->
    @vite('resources/css/email.css')
</head>

<div class="container">
    <div class="row justify-content-center">
        <div class="col-md-8">
            <div class="formBox card login">

                <div class="buttonsLoginRegister">
                    <a class="{{ Route::is('password.request') ? 'buttonsLoginRegisterStyle' : 'inputsLoginRegister' }}" href="{{ route('password.request') }}">Recuperar Contraseña</a>
                </div>

                <div class="card-body">
                    @if (session('status'))
                        <div class="alert alert-success" role="alert">
                            {{ session('status') }}
                        </div>
                    @endif

                    <form method="POST" action="{{ route('password.email') }}">
                        @csrf

                        <div class="ps-5 pe-5 mb-5">
                            <label for="email" class="inputName pb-2  {{ $isMobile ? 'ocultar' : '' }}">{{ __('Email') }}</label>

                            <div class="">
                                <input id="email" type="email" class="form-control @error('email') is-invalid @enderror" name="email" value="{{ old('email') }}" required autocomplete="email" placeholder="{{ $isMobile ? 'Email' : '' }}" autofocus>

                                @error('email')
                                    <span class="invalid-feedback" role="alert">
                                        <strong>{{ $message }}</strong>
                                    </span>
                                @enderror
                            </div>
                        </div>

                        <div class="loginButton">
                            <button type="submit" class="botonStyle">
                                {{ __('Enviar enlace de recuperación') }}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection