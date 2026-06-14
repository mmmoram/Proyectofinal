import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, FlatList, Image, TouchableOpacity,
  ActivityIndicator, StatusBar, LayoutAnimation, Platform, UIManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NavigationProps } from '../navigation/typesNavigation';
import { appStyles, COLORS } from '../styles/appStyles';
import { recipeService } from '../services/recipeService';
import { MealPreview, Category } from '../types/recipe';
import { translateCategory } from '../utils/translations';

// LayoutAnimation en Android requiere habilitar el flag experimental
if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProps>();

  const [query, setQuery] = useState('');
  const [meals, setMeals] = useState<MealPreview[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fromCache, setFromCache] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showCategories, setShowCategories] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    loadCategories();
    doSearch('');
  }, []);

  const loadCategories = async () => {
    const result = await recipeService.getCategories();
    setCategories(result.categories);
  };

  const doSearch = async (text: string) => {
    setLoading(true);
    setErrorMsg('');
    setSelectedCategory(null);
    const result = await recipeService.searchMeals(text);
    setMeals(result.meals);
    setFromCache(result.fromCache);
    if (result.error) setErrorMsg(result.error);
    setLoading(false);
  };

  const handleSearchChange = (text: string) => {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(text), 500);
  };

  const toggleCategories = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowCategories(prev => !prev);
  };

  const handleCategoryPress = async (cat: string) => {
    // Cerrar panel y quitar filtro si se toca la misma categoría
    if (selectedCategory === cat) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setShowCategories(false);
      setSelectedCategory(null);
      doSearch(query);
      return;
    }
    // Seleccionar categoría y cerrar panel automáticamente
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowCategories(false);
    setSelectedCategory(cat);
    setLoading(true);
    setErrorMsg('');
    const result = await recipeService.filterByCategory(cat);
    setMeals(result.meals);
    setFromCache(result.fromCache);
    if (result.error) setErrorMsg(result.error);
    setLoading(false);
  };

  return (
    <SafeAreaView style={appStyles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={{
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4,
      }}>
        <Text style={{ fontSize: 26, fontWeight: '800', color: COLORS.textPrimary }}>
          🍳 MisRecetas
        </Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Favorites')}
            style={{ backgroundColor: COLORS.white, padding: 10, borderRadius: 12, elevation: 3 }}
          >
            <Text style={{ fontSize: 20 }}>❤️</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('Profile')}
            style={{ backgroundColor: COLORS.white, padding: 10, borderRadius: 12, elevation: 3 }}
          >
            <Text style={{ fontSize: 20 }}>👤</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Buscador */}
      <View style={{ paddingHorizontal: 16, marginTop: 8 }}>
        <TextInput
          style={[appStyles.input, { marginBottom: 0 }]}
          placeholder="🔍  Buscar receta..."
          placeholderTextColor={COLORS.textSecondary}
          value={query}
          onChangeText={handleSearchChange}
          returnKeyType="search"
          onSubmitEditing={() => doSearch(query)}
        />
      </View>

      {/* Filtro por categorías — panel retráctil */}
      {categories.length > 0 && (
        <View style={{ marginHorizontal: 16, marginTop: 10 }}>

          {/* Cabecera — toca para abrir/cerrar */}
          <TouchableOpacity
            onPress={toggleCategories}
            activeOpacity={0.8}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: COLORS.white,
              borderRadius: 16,
              paddingHorizontal: 16,
              paddingVertical: 11,
              elevation: 3,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.07,
              shadowRadius: 8,
            }}
          >
            <Text style={{ fontWeight: '700', fontSize: 14, color: COLORS.textPrimary }}>
              🗂️ Filtrar por categoría
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              {/* Chip de la categoría activa (visible aunque el panel esté cerrado) */}
              {selectedCategory && (
                <View style={{
                  backgroundColor: COLORS.primary,
                  borderRadius: 10,
                  paddingHorizontal: 10,
                  paddingVertical: 3,
                }}>
                  <Text style={{ color: COLORS.white, fontSize: 12, fontWeight: '800' }}>
                    {translateCategory(selectedCategory)}
                  </Text>
                </View>
              )}
              <Text style={{ fontSize: 13, color: COLORS.textSecondary, fontWeight: '700' }}>
                {showCategories ? '▲' : '▼'}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Grid de chips — se muestra solo cuando está expandido */}
          {showCategories && (
            <View style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              backgroundColor: COLORS.white,
              borderRadius: 16,
              marginTop: 6,
              padding: 10,
              elevation: 2,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06,
              shadowRadius: 6,
            }}>
              {categories.map((cat) => {
                const active = selectedCategory === cat.strCategory;
                return (
                  <TouchableOpacity
                    key={cat.idCategory}
                    onPress={() => handleCategoryPress(cat.strCategory)}
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 8,
                      borderRadius: 20,
                      backgroundColor: active ? COLORS.primary : COLORS.primaryLight,
                      borderWidth: active ? 0 : 1,
                      borderColor: COLORS.border,
                      margin: 4,
                    }}
                  >
                    <Text style={{
                      fontSize: 13,
                      fontWeight: '700',
                      color: active ? COLORS.white : COLORS.textPrimary,
                    }}>
                      {translateCategory(cat.strCategory)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      )}

      {/* Aviso caché / error */}
      {fromCache && !errorMsg && (
        <View style={{ marginHorizontal: 16, marginTop: 8, backgroundColor: '#FEF3C7', borderRadius: 8, padding: 8 }}>
          <Text style={{ fontSize: 12, color: '#92400E', fontWeight: '600' }}>
            📦 Sin conexión — mostrando datos en caché
          </Text>
        </View>
      )}
      {errorMsg !== '' && (
        <View style={{ marginHorizontal: 16, marginTop: 8, backgroundColor: '#FEE2E2', borderRadius: 8, padding: 8 }}>
          <Text style={{ fontSize: 12, color: '#991B1B', fontWeight: '600' }}>⚠️ {errorMsg}</Text>
        </View>
      )}

      {/* Lista */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={{ marginTop: 12, color: COLORS.textSecondary, fontWeight: '600' }}>
            Buscando recetas...
          </Text>
        </View>
      ) : meals.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
          <Text style={{ fontSize: 56 }}>🍽️</Text>
          <Text style={{ fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, marginTop: 12, textAlign: 'center' }}>
            No se encontraron recetas
          </Text>
          <Text style={{ color: COLORS.textSecondary, textAlign: 'center', marginTop: 8 }}>
            Intenta con otro nombre o selecciona una categoría
          </Text>
        </View>
      ) : (
        <FlatList
          data={meals}
          keyExtractor={item => item.idMeal}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={{
                backgroundColor: COLORS.white,
                borderRadius: 24,
                marginVertical: 0,
                overflow: 'hidden',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.07,
                shadowRadius: 16,
                elevation: 4,
              }}
              onPress={() => navigation.navigate('Detail', { idMeal: item.idMeal })}
              activeOpacity={0.85}
            >
              <Image
                source={{ uri: item.strMealThumb }}
                style={{ width: '100%', height: 180 }}
                resizeMode="cover"
              />
              <View style={{ padding: 16 }}>
                <Text
                  style={{ fontSize: 17, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 8 }}
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
