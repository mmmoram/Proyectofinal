# Manual de Usuario — MisRecetas

**Materia:** Aplicaciones Móviles  
**Tecnologías:** React Native · Expo SDK 54 · TypeScript · Firebase Firestore  
**API:** TheMealDB (pública, sin autenticación, clave "1")

---

## 1. Descripción General

**MisRecetas** es una aplicación móvil que permite:

- Buscar recetas de cocina desde la API pública TheMealDB
- Filtrar recetas por categoría (Pollo, Pasta, Postres, etc.)
- Ver el detalle completo de cada receta: imagen, ingredientes, instrucciones
- Guardar recetas como favoritas en Firebase Firestore (nube)
- Asociar una fotografía propia (cámara o galería) a cada favorito
- Acceder al contenido sin conexión mediante caché local (AsyncStorage)
- Autenticarse con correo y contraseña mediante Firebase Auth

---

## 2. Requisitos para Ejecutar

| Requisito | Versión |
|-----------|---------|
| Node.js | 18 o superior |
| Expo Go (celular) | Última versión disponible |
| Conexión a internet | Para primera carga y Firebase |

### Pasos de ejecución

```bash
# 1. Entrar a la carpeta del proyecto
cd proyecto-final

# 2. Iniciar el servidor Expo
npx expo start --clear

# 3. Escanear el código QR con Expo Go (Android) 
#    o la cámara del iPhone (iOS)
```

---

## 3. Pantallas de la Aplicación

---

### 3.1 Pantalla de Inicio de Sesión

**Ruta:** Primera pantalla al abrir la app

**Funcionalidad:**
- Ingreso con correo electrónico y contraseña
- Validación de campos vacíos y formato de correo
- Mensajes de error traducidos al español (correo inválido, contraseña incorrecta, sin conexión, etc.)
- Enlace directo a la pantalla de Crear Cuenta

**Credenciales de prueba:**
```
Correo:     usuario@prueba.com
Contraseña: 123456
```
> Si no existe la cuenta, créala primero desde "Crear cuenta"

---

### 3.2 Pantalla de Registro

**Funcionalidad:**
- Campos: Nombre completo, Correo electrónico, Contraseña, Confirmar contraseña
- Validación: contraseña mínimo 6 caracteres, ambas contraseñas coincidentes
- Al registrarse exitosamente redirige al Login automáticamente

---

### 3.3 Pantalla Principal — Búsqueda de Recetas

**Acceso:** Luego de iniciar sesión

**Funcionalidades:**

#### Búsqueda por nombre
- Escribe en el campo de búsqueda ("Buscar receta...")
- La búsqueda se ejecuta automáticamente 500ms después de dejar de escribir (debounce)
- Muestra: imagen de la receta, nombre y categoría en español
- Si no hay resultados muestra el mensaje "No se encontraron recetas"

#### Menú de categorías retráctil
- Toca **"🗂️ Filtrar por categoría ▼"** para desplegar el menú
- Se muestran las 14 categorías disponibles de TheMealDB en español:
  - 🥩 Res · 🍗 Pollo · 🍰 Postres · 🐑 Cordero · 🍲 Varios
  - 🍝 Pasta · 🥓 Cerdo · 🦐 Mariscos · 🥗 Guarnición · 🥗 Entrada
  - 🥦 Vegano · 🥕 Vegetariano · 🍳 Desayuno · 🐐 Cabra
- Al tocar una categoría, el menú se cierra y muestra las recetas filtradas
- La categoría activa se muestra como chip en la cabecera del menú
- Tocar la misma categoría la deselecciona

#### Indicador de caché offline
- Banner amarillo **"📦 Sin conexión — mostrando datos en caché"** cuando no hay internet
- La app funciona con datos previamente descargados (caché de 1 hora)

#### Navegación
- Botón ❤️ → va a Mis Favoritos
- Botón 👤 → va a Mi Perfil

---

### 3.4 Pantalla de Detalle de Receta

**Acceso:** Tocar cualquier receta en el listado

**Contenido mostrado:**
- Imagen principal de la receta (260px de alto)
- Nombre de la receta
- Etiqueta de categoría (en español)
- Etiqueta de origen/país (en español, ej: "🌍 Italiana")
- Lista de ingredientes con cantidades (traducidos al español)
- Instrucciones de preparación (traducidas al español mediante IA — Gemini 1.5 Flash)
  - Mientras se traduce muestra: "Traduciendo al español..."
  - Las traducciones se cachean en el dispositivo para no repetir la llamada

**Agregar a Favoritos:**
1. Toca el botón **"❤️ Agregar a Favoritos"**
2. Aparece un menú con tres opciones:
   - **📷 Tomar foto** → abre la cámara del dispositivo
   - **🖼️ Elegir de galería** → abre la galería de fotos
   - **Sin foto** → guarda solo la receta sin imagen propia
3. Al guardar, aparece inmediatamente:
   - Banner verde fijo en la parte superior: **"✅ ¡Guardado en favoritos!"**
   - El botón cambia a verde con texto "✅ ¡Guardado!"
   - Después de 3 segundos vuelve al estado normal en rojo "💔 Quitar de Favoritos"

**Quitar de Favoritos:**
- Si la receta ya es favorita, toca **"💔 Quitar de Favoritos"**
- Aparece un diálogo de confirmación antes de eliminar

---

### 3.5 Pantalla de Mis Favoritos

**Acceso:** Botón ❤️ en la pantalla principal

**Funcionalidades:**
- Lista de todas las recetas marcadas como favoritas
- Actualización en **tiempo real** (Firebase Firestore onSnapshot) — si guardas un favorito en otra sesión, aparece automáticamente
- Muestra el contador de recetas guardadas
- Si no hay favoritos, muestra estado vacío con botón "Explorar Recetas"

**Cada tarjeta de favorito muestra:**
- Foto propia del usuario (si se tomó una) o miniatura oficial de la receta
- Badge **"📷 Mi foto"** si el usuario asoció una fotografía propia
- Nombre de la receta
- Categoría en español

**Eliminar favorito:**
- Toca el botón 🗑️ en la esquina superior derecha de la tarjeta
- Confirma en el diálogo que aparece
- El favorito desaparece en tiempo real

**Navegar al detalle:**
- Toca cualquier tarjeta para ir al detalle completo de esa receta

---

### 3.6 Pantalla de Perfil

**Acceso:** Botón 👤 en la pantalla principal

**Información mostrada:**
- Avatar de usuario
- Nombre (extraído del correo)
- Correo electrónico registrado en Firebase Auth
- Contador de recetas favoritas (actualizado en tiempo real)
- Progresión de niveles (se activan a partir de 5 favoritos):
  - A partir de 5 → 🥄 Aficionado
  - A partir de 10 → 🍳 Cocinero Activo
  - A partir de 20 → 👨‍🍳 Chef Experto
- Panel "Próximo nivel en X recetas"

**Cerrar Sesión:**
- Toca **"Cerrar Sesión"** (botón rojo)
- Confirma en el diálogo
- Redirige al Login y limpia la sesión de Firebase Auth

---

## 4. Arquitectura Técnica

### Tecnologías utilizadas

| Tecnología | Uso |
|------------|-----|
| React Native + Expo SDK 54 | Framework de desarrollo móvil |
| TypeScript | Tipado estático de todo el proyecto |
| React Navigation (NativeStack) | Navegación entre pantallas con params tipados |
| Firebase Auth | Autenticación con correo/contraseña |
| **Firebase Firestore** | Base de datos en la nube para favoritos |
| AsyncStorage | Caché local de recetas (TTL 1 hora) |
| expo-image-picker | Cámara y galería del dispositivo |
| @google/generative-ai | Traducción de instrucciones (Gemini 1.5 Flash) |
| react-native-svg | Fondo degradado con cuadrícula |

### Endpoints de TheMealDB consumidos

```
Búsqueda por nombre:  GET /api/json/v1/1/search.php?s={nombre}
Detalle por ID:       GET /api/json/v1/1/lookup.php?i={idMeal}
Listado categorías:   GET /api/json/v1/1/categories.php
Filtro por categoría: GET /api/json/v1/1/filter.php?c={categoria}
```

### Estructura de Firestore

**Colección:** `favorites`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `userId` | string | UID del usuario autenticado |
| `idMeal` | string | ID de la receta en TheMealDB |
| `strMeal` | string | Nombre de la receta |
| `strCategory` | string | Categoría |
| `strMealThumb` | string | URL de la imagen oficial |
| `photoUrl` | string \| null | URI de la foto propia del usuario |
| `createdAt` | string | Fecha ISO de creación |

### Interfaces TypeScript definidas

```typescript
// src/types/recipe.ts
interface MealPreview   // Para el listado: id, nombre, categoría, imagen
interface Meal          // Detalle completo: instrucciones, 20 ingredientes/medidas
interface Category      // Categorías de TheMealDB
interface Favorito      // Receta guardada + foto + metadatos
interface IngredientItem // Ingrediente con su medida
type Receta = Meal      // Alias requerido por el enunciado
```

---

## 5. Cumplimiento de Requisitos

| Requisito | Descripción | ✅ Cumplido |
|-----------|-------------|------------|
| **2.1** | Listado con imagen, nombre y categoría desde TheMealDB | ✅ |
| **2.1** | Indicador de carga (ActivityIndicator) | ✅ |
| **2.2** | Detalle con instrucciones e ingredientes/medidas | ✅ |
| **2.2** | Navegación con React Navigation e idMeal tipado | ✅ |
| **2.3** | Filtrado por categoría (14 categorías, menú retráctil) | ✅ |
| **2.4** | Interfaces `Receta` y `Favorito` en TypeScript | ✅ |
| **2.4** | Props, estados y params de navegación tipados | ✅ |
| **2.5** | Manejo de `meals === null` | ✅ |
| **2.5** | Errores HTTP distintos de 2xx | ✅ |
| **2.5** | Errores de red con mensaje al usuario | ✅ |
| **2.6** | AsyncStorage — caché de búsquedas y detalles | ✅ |
| **2.6** | Disponible sin conexión desde caché | ✅ |
| **2.7** | Firebase Firestore — guardar favorito | ✅ |
| **2.7** | Firebase Firestore — leer favoritos | ✅ |
| **2.7** | Firebase Firestore — eliminar favorito | ✅ |
| **2.7** | Actualización en tiempo real (`onSnapshot`) | ✅ |
| **2.8** | Cámara del dispositivo (expo-image-picker) | ✅ |
| **2.8** | Galería del dispositivo (expo-image-picker) | ✅ |
| **2.8** | Solicitud y validación de permisos | ✅ |
| **2.8** | Foto asociada y mostrada junto al favorito | ✅ |

---

## 6. Estructura de Archivos del Proyecto

```
proyecto-final/
├── App.tsx                          # Punto de entrada, fondo global
├── src/
│   ├── config/
│   │   ├── firebase.ts              # Configuración Firebase (Auth + Firestore)
│   │   └── apiConfig.ts             # Clave Gemini API
│   ├── context/
│   │   └── AuthContext.tsx          # Proveedor de autenticación global
│   ├── navigation/
│   │   ├── StackNavigator.tsx       # Definición de rutas
│   │   └── typesNavigation.ts       # Tipos de navegación (RootStackParamList)
│   ├── screens/
│   │   ├── LoginScreen.tsx          # Inicio de sesión
│   │   ├── RegisterScreen.tsx       # Registro de usuario
│   │   ├── HomeScreen.tsx           # Listado y búsqueda de recetas
│   │   ├── DetailScreen.tsx         # Detalle de receta + favoritos + cámara
│   │   ├── FavoritesScreen.tsx      # Lista de favoritos en tiempo real
│   │   └── ProfileScreen.tsx        # Perfil de usuario
│   ├── services/
│   │   ├── recipeService.ts         # Llamadas a TheMealDB + caché AsyncStorage
│   │   ├── favoritesService.ts      # CRUD Firestore (guardar/leer/eliminar)
│   │   └── translateService.ts      # Traducción con Gemini + caché
│   ├── types/
│   │   └── recipe.ts                # Interfaces: Receta, Favorito, Category, etc.
│   ├── utils/
│   │   ├── translations.ts          # Traducciones estáticas (categorías, áreas, ingredientes)
│   │   └── validations.ts           # Validación de formularios
│   └── components/
│       └── AppBackground.tsx        # Fondo degradado + cuadrícula (react-native-svg)
├── README.md                        # Documentación técnica
└── MANUAL_USUARIO.md                # Este manual
```

---

*Evaluación Supletoria — Aplicaciones Móviles*  
*Universidad Tecnológica Israel*
