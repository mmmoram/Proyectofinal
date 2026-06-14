import React from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StackNavigator } from './src/navigation/StackNavigator';
import { AuthProvider } from './src/context/AuthContext';
import AppBackground from './src/components/AppBackground';

export default function App() {
  return (
    <View style={{ flex: 1 }}>
      {/* Fondo global: gradiente + cuadrícula detrás de toda la app */}
      <AppBackground />
      <SafeAreaProvider>
        <AuthProvider>
          <NavigationContainer>
            <StackNavigator />
          </NavigationContainer>
        </AuthProvider>
      </SafeAreaProvider>
    </View>
  );
}
