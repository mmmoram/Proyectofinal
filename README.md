# MisRecetas

Aplicación móvil desarrollada con **React Native + Expo + TypeScript** como evaluación supletoria de la materia Aplicaciones Móviles.

## Descripción

MisRecetas permite buscar recetas de cocina a través de la API pública TheMealDB, ver el detalle de cada receta, guardar favoritos en la nube y asociar fotografías propias a cada favorito mediante la cámara o galería del dispositivo.

---

## Tecnología de base de datos en la nube

> **Firebase Firestore** (Google Firebase)

Se utiliza Firestore para persistir las recetas marcadas como favoritas. La colección `favorites` almacena los documentos con los campos: `userId`, `idMeal`, `strMeal`, `strCategory`, `strMealThumb`, `photoUrl` y `createdAt`.

La pantalla de favoritos usa `onSnapshot` de Firestore para actualización en tiempo real sin necesidad de recargar.

---

## Requisitos funcionales implementados

### 2.1 Listado y búsqueda
- API: `https://www.themealdb.com/api/json/v1/1/search.php?s={nombre}`
- Muestra imagen (`strMealThumb`), nombre (`strMeal`) y categoría (`strCategory`)
- Indicador de carga (`ActivityIndicator`) mientras se obtienen datos

### 2.2 Detalle y navegación
- API: `https://www.themealdb.com/api/json/v1/1/lookup.php?i={idMeal}`
- Navegación con React Navigation (NativeStack) con `idMeal` como parámetro tipado
- Muestra instrucciones (`strInstructions`) e ingredientes con medidas (`strIngredient1-20` / `strMeasure1-20`)

### 2.3 Filtrado por categoría
- API categorías: `https://www.themealdb.com/api/json/v1/1/categories.php`
- API filtro: `https://www.themealdb.com/api/json/v1/1/filter.php?c={categoria}`
- Menú horizontal de chips en la pantalla principal

### 2.4 Tipado con TypeScript
Interfaces definidas en `src/types/recipe.ts`:
- `Receta` (alias de `Meal`): datos completos de la receta
- `MealPreview`: datos resumidos para el listado
- `Favorito`: receta guardada con foto y metadatos
- `Category`: categoría de TheMealDB
- `IngredientItem`: ingrediente con su medida
- `RootStackParamList`: parámetros tipados de navegación

### 2.5 Manejo de errores
- `meals === null` → devuelve array vacío
- Errores HTTP != 2xx → mensaje al usuario
- Error de red (sin conexión) → fallback a caché local con banner informativo

### 2.6 Almacenamiento local (AsyncStorage)
- Caché de búsquedas, detalles, categorías y filtros con TTL de 1 hora
- Acceso sin conexión mediante caché vencida (`readStaleCache`)
- Banner "📦 Sin conexión — mostrando datos en caché" cuando se sirven datos locales

### 2.7 Base de datos en la nube — **Firebase Firestore**
- `addDoc`: guardar favorito
- `onSnapshot`: leer en tiempo real y actualizar UI automáticamente
- `deleteDoc`: eliminar favorito

### 2.8 Cámara y galería
- `expo-image-picker` para cámara (`launchCameraAsync`) y galería (`launchImageLibraryAsync`)
- Solicitud de permisos antes de usar cada funcionalidad
- Mensaje al usuario cuando el permiso es denegado
- Foto guardada como URI local asociada al favorito en Firestore
- Foto mostrada en la pantalla de favoritos (con badge "📷 Mi foto")

---

## Estructura del proyecto

```
src/
├── config/         # firebase.ts, apiConfig.ts
├── context/        # AuthContext.tsx
├── navigation/     # StackNavigator.tsx, typesNavigation.ts
├── screens/        # Login, Register, Home, Detail, Favorites, Profile
├── services/       # recipeService.ts, favoritesService.ts, translateService.ts
├── types/          # recipe.ts (Receta, Favorito, MealPreview, Category)
├── utils/          # translations.ts, validations.ts
└── components/     # AppBackground.tsx
```

## Ejecución

```bash
cd proyecto-final
npx expo start --clear
```

Escanear el QR con **Expo Go** en el dispositivo móvil.
