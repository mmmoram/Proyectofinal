import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import { appStyles, COLORS } from '../styles/appStyles';
import { useAuth } from '../context/AuthContext';
import { NavigationProps } from '../navigation/typesNavigation';
import { favoritesService } from '../services/favoritesService';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const navigation = useNavigation<NavigationProps>();
  const [favCount, setFavCount] = useState(0);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      const unsubscribe = favoritesService.subscribeFavorites(user.uid, (faves) => {
        setFavCount(faves.length);
      });
      return unsubscribe;
    }, [user])
  );

  const handleLogout = () => {
    Alert.alert('Cerrar Sesión', '¿Estás seguro de que deseas cerrar sesión?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar Sesión',
        style: 'destructive',
        onPress: async () => {
          setIsLoggingOut(true);
          try {
            await logout();
            navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
          } catch {
            Alert.alert('Error', 'No se pudo cerrar la sesión. Intenta nuevamente.');
            setIsLoggingOut(false);
          }
        },
      },
    ]);
  };

  const displayEmail = user?.email ?? 'usuario@misrecetas.com';
  const displayName = displayEmail.split('@')[0];

  const getBadge = (count: number): { title: string; color: string } | null => {
    if (count >= 20) return { title: 'Chef Experto 👨‍🍳', color: '#F59E0B' };
    if (count >= 10) return { title: 'Cocinero Activo 🍳', color: COLORS.primary };
    if (count >= 5)  return { title: 'Aficionado 🥄', color: COLORS.secondary };
    return null;
  };

  const badge = getBadge(favCount);
  const badgeEl = badge ? (
    <View style={{
      backgroundColor: badge.color + '20',
      paddingHorizontal: 20, paddingVertical: 8,
      borderRadius: 20, borderWidth: 1.5, borderColor: badge.color,
    }}>
      <Text style={{ color: badge.color, fontWeight: '800', fontSize: 15 }}>{badge.title}</Text>
    </View>
  ) : null;

  return (
    <SafeAreaView style={appStyles.container}>
      <ScrollView contentContainerStyle={appStyles.content}>

        {/* Tarjeta de perfil */}
        <View style={[appStyles.card, { alignItems: 'center', paddingVertical: 36 }]}>
          <Image
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' }}
            style={{ width: 96, height: 96, borderRadius: 48, marginBottom: 14 }}
          />
          <Text style={{ fontSize: 22, fontWeight: '800', color: COLORS.textPrimary, textTransform: 'capitalize' }}>
            {displayName}
          </Text>
          <Text style={{ fontSize: 14, color: COLORS.textSecondary, marginBottom: 20 }}>{displayEmail}</Text>

          {badgeEl}
        </View>

        {/* Estadísticas */}
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
          <View style={[appStyles.card, { flex: 1, alignItems: 'center' }]}>
            <Text style={{ fontSize: 36, fontWeight: '800', color: COLORS.primary }}>{favCount}</Text>
            <Text style={{ fontSize: 13, color: COLORS.textSecondary, textAlign: 'center', fontWeight: '600' }}>
              Recetas Favoritas
            </Text>
          </View>
          <View style={[appStyles.card, { flex: 1, alignItems: 'center', justifyContent: 'center' }]}>
            <Text style={{ fontSize: 13, color: COLORS.textSecondary, textAlign: 'center', marginBottom: 6 }}>
              Próximo nivel en:
            </Text>
            <Text style={{ fontSize: 18, fontWeight: '700', color: COLORS.primary }}>
              {favCount < 5 ? `${5 - favCount} recetas`
                : favCount < 10 ? `${10 - favCount} recetas`
                : favCount < 20 ? `${20 - favCount} recetas`
                : '¡Nivel máximo!'}
            </Text>
          </View>
        </View>

        {/* Botón cerrar sesión */}
        <TouchableOpacity
          style={[appStyles.buttonPrimary, { backgroundColor: COLORS.danger, marginTop: 36, marginBottom: 20 }]}
          onPress={handleLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut
            ? <ActivityIndicator color={COLORS.white} />
            : <Text style={appStyles.buttonText}>Cerrar Sesión</Text>
          }
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
