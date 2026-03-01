import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { Colors } from '../../constants/colors';
import UserService from '../../services/UserService';

interface Props {
  onNavigateToLogin: () => void;
}

export default function RegisterScreen({ onNavigateToLogin }: Props) {
  const [usuario, setUsuario] = useState('');
  const [email, setEmail] = useState('');
  const [contrasenia, setContrasenia] = useState('');
  const [mostrarContrasenia, setMostrarContrasenia] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleRegister = async () => {
    setErrorMsg('');
    if (!usuario.trim() || !email.trim() || !contrasenia.trim()) {
      setErrorMsg('Por favor, rellene todos los campos');
      return;
    }
    if (contrasenia.length < 6) {
      setErrorMsg('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setIsLoading(true);
    try {
      await UserService.registerUser({
        username: usuario.trim(),
        name: usuario.trim(),
        email: email.trim().toLowerCase(),
        password: contrasenia,
        password_confirmation: contrasenia,
      });

      onNavigateToLogin();
    } catch (error: any) {
      let mensaje = 'Error al registrar. Inténtalo de nuevo.';
      const msg = (error.message || '').toLowerCase();
      if (msg.includes('email') || msg.includes('correo')) {
        mensaje = 'Ese correo ya está registrado.';
      } else if (msg.includes('username') || msg.includes('usuario')) {
        mensaje = 'Ese nombre de usuario ya está en uso.';
      } else if (error.message) {
        mensaje = error.message;
      }
      setErrorMsg(mensaje);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formWrapper}>
        <Image
          source={require('../../assets/images/Group 134.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>OlivaTour</Text>
        <Text style={styles.welcome}>¡Bienvenido!</Text>

        <TextInput
          style={styles.input}
          placeholder="Usuario"
          placeholderTextColor={Colors.grayMedium}
          value={usuario}
          onChangeText={setUsuario}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TextInput
          style={styles.input}
          placeholder="Correo electrónico"
          placeholderTextColor={Colors.grayMedium}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <View style={styles.passwordContainer}>
          <TextInput
            style={[styles.input, styles.passwordInput]}
            placeholder="Contraseña"
            placeholderTextColor={Colors.grayMedium}
            value={contrasenia}
            onChangeText={setContrasenia}
            secureTextEntry={!mostrarContrasenia}
            autoCapitalize="none"
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setMostrarContrasenia(!mostrarContrasenia)}
          >
            <Text style={styles.eyeText}>{mostrarContrasenia ? '🙈' : '👁'}</Text>
          </TouchableOpacity>
        </View>

        {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

        <TouchableOpacity
          style={styles.registerButton}
          onPress={handleRegister}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.registerButtonText}>Registrarse</Text>
          )}
        </TouchableOpacity>

        <View style={styles.loginRow}>
          <Text style={styles.loginText}>¿Ya tienes una cuenta? </Text>
          <TouchableOpacity onPress={onNavigateToLogin}>
            <Text style={styles.loginLink}>Inicia Sesión</Text>
          </TouchableOpacity>
        </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.verdeFondo,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formWrapper: {
    width: '100%',
    maxWidth: 480,
  },
  errorText: {
    color: '#c0392b',
    fontFamily: 'Urbanist-Regular',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 12,
    backgroundColor: '#fdecea',
    padding: 10,
    borderRadius: 8,
  },
  logo: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginTop: 30,
    marginBottom: 4,
  },
  title: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 64,
    color: Colors.verdeOscuro,
    textAlign: 'center',
    marginBottom: 4,
    marginTop: 0,
  },
  welcome: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 30,
    color: Colors.black,
  },
  input: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.verdeOscuro,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontFamily: 'Urbanist-Regular',
    fontSize: 18,
    marginBottom: 16,
    color: Colors.black,
  },
  passwordContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  passwordInput: {
    paddingRight: 50,
    marginBottom: 0,
  },
  eyeButton: {
    position: 'absolute',
    right: 14,
    top: 14,
  },
  eyeText: {
    fontSize: 20,
  },
  registerButton: {
    backgroundColor: Colors.verdeSeleccionado,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 14,
  },
  registerButtonText: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 18,
    color: Colors.white,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
  },
  loginText: {
    fontFamily: 'Urbanist-Regular',
    fontSize: 18,
    color: Colors.black,
  },
  loginLink: {
    fontFamily: 'Urbanist-Regular',
    fontSize: 18,
    color: Colors.verdeOscuro,
  },
});
