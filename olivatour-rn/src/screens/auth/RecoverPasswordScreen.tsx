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
} from 'react-native';
import { Colors } from '../../constants/colors';
import UserService from '../../services/UserService';

interface Props {
  onNavigateToLogin: () => void;
}

export default function RecoverPasswordScreen({ onNavigateToLogin }: Props) {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleStep1 = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Introduce tu correo electrónico');
      return;
    }

    setIsLoading(true);
    try {
      await UserService.forgotPassword(email.trim().toLowerCase());
      Alert.alert(
        'Correo enviado',
        'Hemos enviado un enlace de recuperación a tu correo.',
        [{ text: 'Continuar', onPress: () => setStep(2) }]
      );
    } catch {
      Alert.alert('Error', 'No se pudo enviar el correo. Comprueba que el email es correcto.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep2 = async () => {
    if (!token.trim() || !newPassword.trim()) {
      Alert.alert('Error', 'Rellene todos los campos');
      return;
    }

    setIsLoading(true);
    try {
      await UserService.resetPassword(email, token.trim(), newPassword);
      Alert.alert(
        '¡Contraseña restablecida!',
        'Ya puedes iniciar sesión con tu nueva contraseña.',
        [{ text: 'Iniciar Sesión', onPress: onNavigateToLogin }]
      );
    } catch {
      Alert.alert('Error', 'Token inválido o expirado. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>OlivaTour</Text>
        <Text style={styles.subtitle}>
          {step === 1 ? 'Recuperar contraseña' : 'Nueva contraseña'}
        </Text>

        {step === 1 ? (
          <>
            <Text style={styles.description}>
              Introduce tu correo electrónico y te enviaremos un enlace para recuperar tu contraseña.
            </Text>
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
            <TouchableOpacity style={styles.button} onPress={handleStep1} disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.buttonText}>Enviar correo</Text>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.description}>
              Introduce el código que recibiste en tu correo y tu nueva contraseña.
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Código de verificación"
              placeholderTextColor={Colors.grayMedium}
              value={token}
              onChangeText={setToken}
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Nueva contraseña"
              placeholderTextColor={Colors.grayMedium}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              autoCapitalize="none"
            />
            <TouchableOpacity style={styles.button} onPress={handleStep2} disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.buttonText}>Restablecer contraseña</Text>
              )}
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity onPress={onNavigateToLogin} style={styles.backButton}>
          <Text style={styles.backText}>← Volver al inicio de sesión</Text>
        </TouchableOpacity>
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
  },
  title: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 48,
    color: Colors.verdeOscuro,
    textAlign: 'center',
    marginBottom: 8,
    marginTop: 60,
  },
  subtitle: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 16,
    color: Colors.black,
  },
  description: {
    fontFamily: 'Urbanist-Regular',
    fontSize: 16,
    textAlign: 'center',
    color: Colors.grayDark,
    marginBottom: 24,
    lineHeight: 24,
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
  button: {
    backgroundColor: Colors.verdeSeleccionado,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 18,
    color: Colors.white,
  },
  backButton: {
    marginTop: 30,
    alignSelf: 'center',
  },
  backText: {
    fontFamily: 'Urbanist-Regular',
    fontSize: 16,
    color: Colors.verdeOscuro,
  },
});
