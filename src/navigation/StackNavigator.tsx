import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './typesNavigation';

import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import FormScreen from '../screens/FormScreen';
import ListScreen from '../screens/ListScreen';
import StatsScreen from '../screens/StatsScreen';
import DetailScreen from '../screens/DetailScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ShelterScreen from '../screens/ShelterScreen';
import RegisterScreen from '../screens/RegisterScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const StackNavigator = () => {
  return (
    <Stack.Navigator 
      initialRouteName="Login"
      screenOptions={{ 
        headerShown: true,
        headerStyle: { backgroundColor: '#F0F4F8' },
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: '800', color: '#1E293B' },
        headerTintColor: '#2D5AF0',
        contentStyle: { backgroundColor: '#F0F4F8' },
        animation: 'slide_from_right'
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      
      {/* ✅ AGREGADA LA PANTALLA DE REGISTRO, con tus mismos estilos */}
      <Stack.Screen
        name={"Register" as keyof RootStackParamList}
        component={RegisterScreen}
        options={{ title: 'Crear Cuenta' }}
      />

      <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Salvando Huellas' }} />
      <Stack.Screen name="Form" component={FormScreen} options={{ title: 'Reportar Mascota' }} />
      <Stack.Screen name="List" component={ListScreen} options={{ title: 'Mascotas Rescatadas' }} />
      <Stack.Screen name="Stats" component={StatsScreen} options={{ title: 'Estadísticas' }} />
      <Stack.Screen name="Detail" component={DetailScreen} options={{ title: 'Detalle de Rescate' }} />
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Mi Perfil' }} />
      <Stack.Screen name="Shelters" component={ShelterScreen} options={{ title: 'Asistente de Refugios' }} />
    </Stack.Navigator>
  );
};