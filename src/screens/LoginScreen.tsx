import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, ImageBackground } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { validateLogin } from '../utils/validations';

const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading } = useAuth();

  const handleLogin = async () => {
    const error = validateLogin(email, password);
    if (error) {
      Alert.alert('❌ Error', error);
      return;
    }
    try {
      await login(email, password);
      navigation.navigate('Home');
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
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Encabezado */}
          <View style={styles.headerContainer}>
            <Image
              source={{ uri: 'https://cdn-icons-png.flaticon.com/512/1056/1056854.png' }}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title}>Salvando Huellas</Text>
            <Text style={styles.subtitle}>Ayudando a mascotas a encontrar su hogar</Text>
          </View>

          {/* Formulario */}
          <View style={styles.formContainer}>
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

            {/* Botón Ingresar */}
            <TouchableOpacity 
              style={[styles.primaryButton, loading && styles.buttonDisabled]} 
              onPress={handleLogin} 
              disabled={loading}
            >
              <Text style={styles.primaryButtonText}>
                {loading ? "Verificando..." : "Iniciar Sesión"}
              </Text>
            </TouchableOpacity>

            {/* Enlace Registro */}
            <View style={styles.registerContainer}>
              <Text style={styles.textNormal}>¿Aún no eres parte de nosotros? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.textLink}>Crear cuenta</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
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
    backgroundColor: 'rgba(248, 250, 252, 0.85)', // Transparencia para leer bien
  },
  container: {
    flex: 1,
    paddingHorizontal: 25,
    paddingTop: 60,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 90,
    height: 90,
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
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
    marginBottom: 20,
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
    marginTop: 10,
    marginBottom: 25,
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
  registerContainer: {
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

export default LoginScreen;