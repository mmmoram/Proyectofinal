import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, Image, TouchableOpacity,
  Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NavigationProps } from '../navigation/typesNavigation';
import { appStyles, COLORS } from '../styles/appStyles';
import { favoritesService } from '../services/favoritesService';
import { useAuth } from '../context/AuthContext';
import { Favorito } from '../types/recipe';
import { translateCategory } from '../utils/translations';

export default function FavoritesScreen() {
  const navigation = useNavigation<NavigationProps>();
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Favorito[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    // Suscripción en tiempo real a Firestore
    const unsubscribe = favoritesService.subscribeFavorites(user.uid, (faves) => {
      setFavorites(faves.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
      setLoading(false);
    });
    return unsubscribe;
  }, [user]);

  const handleRemove = (fav: Favorito) => {
    Alert.alert(
      'Eliminar favorito',
      `¿Quitar "${fav.strMeal}" de tus favoritos?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await favoritesService.removeFavorite(fav.id!, user!.uid, fav.idMeal);
            } catch {
              Alert.alert('Error', 'No se pudo eliminar el favorito.');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[appStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: 12, color: COLORS.textSecondary }}>Cargando favoritos...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={appStyles.container}>
      <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 }}>
        <Text style={{ fontSize: 24, fontWeight: '800', color: COLORS.textPrimary }}>❤️ Mis Favoritos</Text>
        <Text style={{ color: COLORS.textSecondary, marginTop: 4, fontSize: 14 }}>
          {favorites.length} receta{favorites.length !== 1 ? 's' : ''} guardada{favorites.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {favorites.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
          <Text style={{ fontSize: 64 }}>🍽️</Text>
          <Text style={{ fontSize: 20, fontWeight: '700', color: COLORS.textPrimary, marginTop: 16, textAlign: 'center' }}>
            Aún no tienes favoritos
          </Text>
          <Text style={{ color: COLORS.textSecondary, textAlign: 'center', marginTop: 8, lineHeight: 22 }}>
            Busca una receta y toca ❤️ para guardarla aquí
          </Text>
          <TouchableOpacity
            style={[appStyles.buttonPrimary, { marginTop: 24 }]}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={appStyles.buttonText}>Explorar Recetas</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={item => item.id!}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={{
                backgroundColor: COLORS.white,
                borderRadius: 24,
                overflow: 'hidden',
                marginVertical: 0,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.07,
                shadowRadius: 16,
                elevation: 4,
              }}
              onPress={() => navigation.navigate('Detail', { idMeal: item.idMeal })}
              activeOpacity={0.85}
            >
              {/* Imagen (foto propia o miniatura) */}
              <View>
                <Image
                  source={{ uri: item.photoUrl ?? item.strMealThumb }}
                  style={{ width: '100%', height: 160 }}
                  resizeMode="cover"
                />
                {item.photoUrl && (
                  <View style={{
                    position: 'absolute', top: 10, left: 10,
                    backgroundColor: COLORS.primary, borderRadius: 10,
                    paddingHorizontal: 10, paddingVertical: 4,
                  }}>
                    <Text style={{ fontSize: 11, color: COLORS.white, fontWeight: '800' }}>📷 Mi foto</Text>
                  </View>
                )}
                {/* Botón eliminar flotante */}
                <TouchableOpacity
                  onPress={() => handleRemove(item)}
                  style={{
                    position: 'absolute', top: 10, right: 10,
                    backgroundColor: '#FEE2E2', borderRadius: 12,
                    padding: 8,
                  }}
                >
                  <Text style={{ fontSize: 16 }}>🗑️</Text>
                </TouchableOpacity>
              </View>

              <View style={{ padding: 16 }}>
                <Text
                  style={{ fontSize: 16, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 8 }}
                  numberOfLines={2}
                >
                  {item.strMeal}
                </Text>
                <View style={{
                  alignSelf: 'flex-start', backgroundColor: COLORS.primaryLight,
                  paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10,
                }}>
                  <Text style={{ fontSize: 12, color: COLORS.primary, fontWeight: '700' }}>
                    {translateCategory(item.strCategory)}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}
