import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './typesNavigation';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import DetailScreen from '../screens/DetailScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const StackNavigator = () => (
  <Stack.Navigator
    initialRouteName="Login"
    screenOptions={{
      headerShown: true,
      headerStyle: { backgroundColor: 'rgba(238, 233, 254, 0.82)' },
      headerShadowVisible: false,
      headerTitleStyle: { fontWeight: '800', color: '#1E293B' },
      headerTintColor: '#6366F1',
      contentStyle: { backgroundColor: 'transparent' },
      animation: 'slide_from_right',
    }}
  >
    <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
    <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Crear Cuenta' }} />
    <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
    <Stack.Screen name="Detail" component={DetailScreen} options={{ title: 'Detalle de Receta' }} />
    <Stack.Screen name="Favorites" component={FavoritesScreen} options={{ title: 'Mis Favoritos' }} />
    <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Mi Perfil' }} />
  </Stack.Navigator>
);
