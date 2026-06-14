import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, Image, TouchableOpacity,
  ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { RootStackParamList, NavigationProps } from '../navigation/typesNavigation';
import { appStyles, COLORS } from '../styles/appStyles';
import { recipeService } from '../services/recipeService';
import { favoritesService } from '../services/favoritesService';
import { translateInstructions } from '../services/translateService';
import { useAuth } from '../context/AuthContext';
import { Meal, IngredientItem } from '../types/recipe';
import { translateCategory, translateArea, translateIngredient } from '../utils/translations';

type DetailRouteProp = RouteProp<RootStackParamList, 'Detail'>;

function extractIngredients(meal: Meal): IngredientItem[] {
  const raw = meal as unknown as Record<string, string>;
  const items: IngredientItem[] = [];
  for (let i = 1; i <= 20; i++) {
    const ingredient = raw[`strIngredient${i}`];
    const measure = raw[`strMeasure${i}`];
    if (ingredient?.trim()) {
      items.push({ ingredient: ingredient.trim(), measure: (measure ?? '').trim() });
    }
  }
  return items;
}

export default function DetailScreen() {
  const route = useRoute<DetailRouteProp>();
  const navigation = useNavigation<NavigationProps>();
  const { user } = useAuth();
  const { idMeal } = route.params;

  const [meal, setMeal] = useState<Meal | null>(null);
  const [loading, setLoading] = useState(true);
  const [fromCache, setFromCache] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isFav, setIsFav] = useState(false);
  const [favDocId, setFavDocId] = useState<string | null>(null);
  const [favLoading, setFavLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const successTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [translatedInstructions, setTranslatedInstructions] = useState<string | null>(null);
  const [translating, setTranslating] = useState(false);

  useEffect(() => { loadMeal(); }, [idMeal]);
  useEffect(() => { if (user) checkFavorite(); }, [user, idMeal]);

  const loadMeal = async () => {
    setLoading(true);
    const result = await recipeService.getMealById(idMeal);
    setMeal(result.meal);
    setFromCache(result.fromCache);
    if (result.error) setErrorMsg(result.error);
    setLoading(false);
    if (result.meal?.strInstructions) {
      translateMealInstructions(result.meal.idMeal, result.meal.strInstructions);
    }
  };

  const translateMealInstructions = async (id: string, text: string) => {
    setTranslating(true);
    const translated = await translateInstructions(id, text);
    setTranslatedInstructions(translated);
    setTranslating(false);
  };

  const checkFavorite = async () => {
    if (!user) return;
    const { isFav: fav, docId } = await favoritesService.isFavorite(user.uid, idMeal);
    setIsFav(fav);
    setFavDocId(docId);
  };

  const handleToggleFavorite = async () => {
    if (!user || !meal) return;

    if (isFav && favDocId) {
      Alert.alert('Quitar favorito', `¿Deseas quitar "${meal.strMeal}" de favoritos?`, [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Quitar', style: 'destructive',
          onPress: async () => {
            setFavLoading(true);
            try {
              await favoritesService.removeFavorite(favDocId, user.uid, idMeal);
              setIsFav(false);
              setFavDocId(null);
            } catch {
              Alert.alert('Error', 'No se pudo eliminar el favorito.');
            }
            setFavLoading(false);
          },
        },
      ]);
      return;
    }

    Alert.alert('❤️ Agregar a Favoritos', '¿Deseas añadir una foto personal?', [
      { text: '📷 Tomar foto',        onPress: () => pickPhoto('camera') },
      { text: '🖼️ Elegir de galería', onPress: () => pickPhoto('gallery') },
      { text: 'Sin foto',             onPress: () => saveFavorite() },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  const pickPhoto = async (source: 'camera' | 'gallery') => {
    if (source === 'camera') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Se requiere acceso a la cámara para tomar una foto.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({ quality: 0.7, allowsEditing: true, aspect: [4, 3] });
      if (!result.canceled) saveFavorite(result.assets[0].uri);
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Se requiere acceso a la galería para seleccionar una imagen.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.7, allowsEditing: true, aspect: [4, 3] });
      if (!result.canceled) saveFavorite(result.assets[0].uri);
    }
  };

  const saveFavorite = async (photoUri?: string) => {
    if (!user || !meal) return;

    // UI optimista: mostrar éxito al instante sin esperar al servidor
    setIsFav(true);
    setSaveSuccess(true);
    if (successTimer.current) clearTimeout(successTimer.current);
    successTimer.current = setTimeout(() => setSaveSuccess(false), 3000);

    try {
      // addFavorite retorna de inmediato (escribe en Firestore en background)
      const docId = await favoritesService.addFavorite({
        userId: user.uid,
        idMeal: meal.idMeal,
        strMeal: meal.strMeal,
        strCategory: meal.strCategory,
        strMealThumb: meal.strMealThumb,
      }, photoUri);
      setFavDocId(docId);
    } catch {
      // Revertir si falla el guardado en Firestore
      setIsFav(false);
      setSaveSuccess(false);
      setFavDocId(null);
      if (successTimer.current) clearTimeout(successTimer.current);
      Alert.alert('Error al guardar', 'No se pudo guardar en la base de datos. Verifica tu conexión.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[appStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: 12, color: COLORS.textSecondary }}>Cargando receta...</Text>
      </SafeAreaView>
    );
  }

  if (!meal) {
    return (
      <SafeAreaView style={[appStyles.container, { justifyContent: 'center', alignItems: 'center', padding: 32 }]}>
        <Text style={{ fontSize: 56 }}>😕</Text>
        <Text style={{ fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, marginTop: 12, textAlign: 'center' }}>
          No se pudo cargar la receta
        </Text>
        {!!errorMsg && (
          <Text style={{ color: COLORS.textSecondary, textAlign: 'center', marginTop: 8 }}>{errorMsg}</Text>
        )}
        <TouchableOpacity style={[appStyles.buttonSecondary, { marginTop: 24 }]} onPress={() => navigation.goBack()}>
          <Text style={appStyles.buttonTextSecondary}>Volver</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const ingredients = extractIngredients(meal);

  return (
    <SafeAreaView style={appStyles.container}>

      {/* ── Banner de éxito FIJO — siempre visible, sobre el scroll ── */}
      {saveSuccess && (
        <View style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          zIndex: 999,
          backgroundColor: '#16A34A',
          paddingVertical: 14,
          paddingHorizontal: 20,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
          elevation: 10,
        }}>
          <Text style={{ fontSize: 24 }}>✅</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: '800', color: '#FFFFFF', fontSize: 16 }}>
              ¡Guardado en favoritos!
            </Text>
            <Text style={{ color: '#DCFCE7', fontSize: 13, marginTop: 2 }}>
              Puedes verlo en ❤️ Mis Favoritos
            </Text>
          </View>
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Imagen principal */}
        <Image source={{ uri: meal.strMealThumb }} style={{ width: '100%', height: 260 }} resizeMode="cover" />

        <View style={[appStyles.content, { paddingTop: 20 }]}>
          {fromCache && (
            <View style={{ backgroundColor: '#FEF3C7', borderRadius: 8, padding: 8, marginBottom: 12 }}>
              <Text style={{ fontSize: 12, color: '#92400E', fontWeight: '600' }}>
                📦 Mostrando datos en caché (sin conexión)
              </Text>
            </View>
          )}

          {/* Nombre y etiquetas */}
          <Text style={{ fontSize: 24, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 10 }}>
            {meal.strMeal}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
            <View style={{ backgroundColor: COLORS.primary, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 }}>
              <Text style={{ color: COLORS.white, fontWeight: '700', fontSize: 13 }}>
                {translateCategory(meal.strCategory)}
              </Text>
            </View>
            {!!meal.strArea && (
              <View style={{ backgroundColor: COLORS.secondary, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 }}>
                <Text style={{ color: COLORS.white, fontWeight: '700', fontSize: 13 }}>
                  🌍 {translateArea(meal.strArea)}
                </Text>
              </View>
            )}
          </View>

          {/* Botón favorito */}
          <TouchableOpacity
            style={[appStyles.buttonPrimary, {
              backgroundColor: saveSuccess
                ? '#16A34A'
                : isFav ? COLORS.danger : COLORS.primary,
              marginBottom: 24,
            }]}
            onPress={handleToggleFavorite}
            disabled={favLoading}
          >
            {favLoading
              ? <ActivityIndicator color={COLORS.white} />
              : <Text style={appStyles.buttonText}>
                  {saveSuccess
                    ? '✅ ¡Guardado!'
                    : isFav ? '💔 Quitar de Favoritos' : '❤️ Agregar a Favoritos'}
                </Text>
            }
          </TouchableOpacity>

          {/* Ingredientes */}
          <Text style={{ fontSize: 20, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 12 }}>
            🛒 Ingredientes
          </Text>
          <View style={[appStyles.card, { padding: 16, marginBottom: 24 }]}>
            {ingredients.map((item, idx) => (
              <View
                key={idx}
                style={{
                  flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                  paddingVertical: 9,
                  borderBottomWidth: idx < ingredients.length - 1 ? 1 : 0,
                  borderBottomColor: COLORS.border,
                }}
              >
                <Text style={{ color: COLORS.textPrimary, fontWeight: '600', flex: 1 }}>
                  • {translateIngredient(item.ingredient)}
                </Text>
                <Text style={{ color: COLORS.textSecondary, fontSize: 13 }}>{item.measure}</Text>
              </View>
            ))}
          </View>

          {/* Instrucciones */}
          <Text style={{ fontSize: 20, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 12 }}>
            📋 Instrucciones
          </Text>
          <View style={[appStyles.card, { padding: 16, marginBottom: 40 }]}>
            {translating ? (
              <View style={{ alignItems: 'center', paddingVertical: 16 }}>
                <ActivityIndicator color={COLORS.primary} />
                <Text style={{ color: COLORS.textSecondary, marginTop: 8, fontSize: 13 }}>
                  Traduciendo al español...
                </Text>
              </View>
            ) : (
              <Text style={{ color: COLORS.textPrimary, lineHeight: 26, fontSize: 15 }}>
                {translatedInstructions ?? meal.strInstructions}
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
