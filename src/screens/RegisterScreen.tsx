import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, ImageBackground, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { auth } from '../config/firebase';
import { updateProfile } from 'firebase/auth';

const RegisterScreen = ({ navigation }: any) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { register, loading } = useAuth();

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('❌ Error', 'Por favor completa todos los campos');
      return;
    }
    if (password.length < 6) {
      Alert.alert('❌ Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('❌ Error', 'Las contraseñas no coinciden');
      return;
    }

    try {
      await register(email, password);
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: name });
      }
      Alert.alert('✅ ¡Bienvenido!', 'Tu cuenta ha sido creada exitosamente', [
        { text: 'Iniciar Sesión', onPress: () => navigation.navigate('Login') }
      ]);
    } catch (err: any) {
      Alert.alert('❌ Error', err.message);
    }
  };

  return (
    <ImageBackground 
      source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3648/3648851.png' }} 
      style={styles.backgroundImage}
      resizeMode="repeat"
    >
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.overlay}>
          <View style={styles.innerContainer}>
            {/* Encabezado */}
            <View style={styles.headerContainer}>
              <Image
                source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' }}
                style={styles.logo}
                resizeMode="contain"
              />
              <Text style={styles.title}>Únete a la Familia</Text>
              <Text style={styles.subtitle}>Crea tu cuenta y ayuda a salvar vidas</Text>
            </View>

            {/* Formulario */}
            <View style={styles.formContainer}>
              <View style={styles.inputWrapper}>
                <Text style={styles.label}>Nombre Completo</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: María López"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.inputWrapper}>
                <Text style={styles.label}>Correo Electrónico</Text>
                <TextInput
                  style={styles.input}
                  placeholder="ejemplo@correo.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.inputWrapper}>
                <Text style={styles.label}>Contraseña</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.inputWrapper}>
                <Text style={styles.label}>Confirmar Contraseña</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Repite tu contraseña"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  placeholderTextColor="#94A3B8"
                />
              </View>

              {/* Botón Registro */}
              <TouchableOpacity 
                style={[styles.primaryButton, loading && styles.buttonDisabled]} 
                onPress={handleRegister} 
                disabled={loading}
              >
                <Text style={styles.primaryButtonText}>
                  {loading ? "Creando cuenta..." : "Crear mi cuenta"}
                </Text>
              </TouchableOpacity>

              {/* Enlace Login */}
              <View style={styles.loginContainer}>
                <Text style={styles.textNormal}>¿Ya tienes cuenta? </Text>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                  <Text style={styles.textLink}>Iniciar sesión</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#F8FAFC',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(248, 250, 252, 0.85)',
    paddingHorizontal: 25,
  },
  container: {
    flex: 1,
  },
  innerContainer: {
    paddingBottom: 40,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 40,
  },
  logo: {
    width: 70,
    height: 70,
    marginBottom: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#2D5AF0',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
  },
  inputWrapper: {
    marginBottom: 18,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#1E293B',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  primaryButton: {
    backgroundColor: '#2D5AF0',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 5,
    marginBottom: 20,
    shadowColor: '#2D5AF0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: '#94A3B8',
    shadowOpacity: 0,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textNormal: {
    fontSize: 14,
    color: '#64748B',
  },
  textLink: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2D5AF0',
  },
});

export default RegisterScreen;