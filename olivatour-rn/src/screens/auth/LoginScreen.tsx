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
import { useAuth } from '../../context/AuthContext';

interface Props {
  onNavigateToRegister: () => void;
  onNavigateToRecover: () => void;
}

export default function LoginScreen({ onNavigateToRegister, onNavigateToRecover }: Props) {
  const { login } = useAuth();
  const [usuario, setUsuario] = useState('');
  const [contrasenia, setContrasenia] = useState('');
  const [mostrarContrasenia, setMostrarContrasenia] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!usuario.trim() || !contrasenia.trim()) {
      Alert.alert('Campos vacíos', 'Rellene los campos para poder continuar');
      return;
    }

    setIsLoading(true);
    try {
      const response = await UserService.loginUser({
        email_or_username: usuario.trim(),
        password: contrasenia,
      });

      if (response.token && response.user) {
        await login(
          response.token,
          response.user.name ?? '',
          response.user.email ?? '',
          response.user.id ?? 0
        );
      } else {
        Alert.alert('Datos erróneos', 'El usuario o la contraseña no son correctos.');
      }
    } catch {
      Alert.alert('Datos erróneos', 'El usuario o la contraseña no son correctos.');
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
        <Text style={styles.title}>OlivaTour</Text>

        <TextInput
          style={styles.input}
          placeholder="Usuario"
          placeholderTextColor={Colors.grayMedium}
          value={usuario}
          onChangeText={setUsuario}
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

        <TouchableOpacity onPress={onNavigateToRecover} style={styles.forgotButton}>
          <Text style={styles.forgotText}>¿Has olvidado tu contraseña?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
          )}
        </TouchableOpacity>

        <View style={styles.registerRow}>
          <Text style={styles.registerText}>¿No tienes una cuenta? </Text>
          <TouchableOpacity onPress={onNavigateToRegister}>
            <Text style={styles.registerLink}>Regístrate</Text>
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
  title: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 64,
    color: Colors.verdeOscuro,
    textAlign: 'center',
    marginBottom: 40,
    marginTop: 60,
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
  forgotButton: {
    marginTop: 16,
    marginBottom: 8,
    alignSelf: 'center',
  },
  forgotText: {
    fontFamily: 'Urbanist-Regular',
    fontSize: 18,
    color: Colors.black,
  },
  loginButton: {
    backgroundColor: Colors.verdeSeleccionado,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonText: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 18,
    color: Colors.white,
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
  },
  registerText: {
    fontFamily: 'Urbanist-Regular',
    fontSize: 18,
    color: Colors.black,
  },
  registerLink: {
    fontFamily: 'Urbanist-Regular',
    fontSize: 18,
    color: Colors.verdeOscuro,
  },
});
