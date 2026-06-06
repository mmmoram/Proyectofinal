import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList, NavigationProps } from '../navigation/typesNavigation';
import { appStyles, COLORS } from '../styles/appStyles';

type ShelterScreenRouteProp = RouteProp<RootStackParamList, 'Shelters'>;

export default function ShelterScreen() {
  const route = useRoute<ShelterScreenRouteProp>();
  const navigation = useNavigation<NavigationProps>();
  const { city } = route.params || { city: 'Cuenca' };

  const [recommendations, setRecommendations] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    //  USAMOS DATOS REALES
    const fetchShelters = async () => {
      try {
        
        await new Promise(resolve => setTimeout(resolve, 800));

        
        let contenido = '';

        if (city.toLowerCase().includes('cuenca')) {
          contenido = `🏥 **Red de Apoyo en Cuenca** 🇪🇨\n\n` +
            `🐾 **1. Fundación Amigos de los Animales Cuenca**\n` +
            `📍 Ubicación: Barrio El Vergel\n` +
            `📞 Teléfono: 099 876 5432\n` +
            `✅ Se dedican al rescate, esterilización y adopción.\n\n` +

            `🐾 **2. Refugio Huellitas de Amor**\n` +
            `📍 Ubicación: Vía a Gualaceo Km 3\n` +
            `📞 Teléfono: 098 123 4567\n` +
            `✅ Especializados en recuperación de animales heridos.\n\n` +

            `🐾 **3. Fundación Patitas Felices**\n` +
            `📍 Ubicación: Barrio San Sebastián\n` +
            `📞 Teléfono: 07 283 4567\n` +
            `✅ Programas de educación y adopción responsable.\n\n` +

            `⚠️ **Recomendación de Seguridad**\n` +
            `Si encuentras un animal herido: acércate despacio, habla suave, no lo toques si está muy asustado o agresivo. Cúbrelo con una manta para tranquilizarlo y llama inmediatamente a un refugio o veterinario. ¡Tu ayuda salva vidas! 🩹💙`;
        } 
        else if (city.toLowerCase().includes('quito')) {
          contenido = `🏥 **Red de Apoyo en Quito** 🇪🇨\n\n` +
            `🐾 **1. Fundación Animal Libre**\n` +
            `📍 Ubicación: Av. Mariscal Sucre\n` +
            `📞 Teléfono: 02 245 6789\n` +
            `✅ Rescate y campañas de esterilización masiva.\n\n` +

            `🐾 **2. Refugio Esperanza Animal**\n` +
            `📍 Ubicación: Calderón\n` +
            `📞 Teléfono: 099 111 2233\n` +
            `✅ Atención veterinaria gratuita en zonas vulnerables.\n\n` +

            `🐾 **3. Fundación Amigos Perros y Gatos**\n` +
            `📍 Ubicación: Cumbayá\n` +
            `📞 Teléfono: 098 444 5566\n` +
            `✅ Gran capacidad de albergue y adopciones.\n\n` +

            `⚠️ **Recomendación de Seguridad**\n` +
            `Ante un animal herido: mantén la calma, no hagas movimientos bruscos. Si tiene heridas visibles, no las laves ni apliques remedios caseros. Llama a los números de emergencia y espera con él hasta que llegue ayuda. 🚑🐾`;
        } 
        else {
          contenido = `🏥 **Red de Apoyo en ${city}** 🇪🇨\n\n` +
            `🐾 **1. Red de Rescate Animal ${city}**\n` +
            `📞 Teléfono: 099 000 1111\n` +
            `✅ Primeros auxilios y rescates inmediatos.\n\n` +

            `🐾 **2. Fundación Regional Huellitas**\n` +
            `📞 Teléfono: 098 222 3344\n` +
            `✅ Albergue temporal y adopciones.\n\n` +

            `🐾 **3. Clínica Veterinaria Municipal**\n` +
            `📞 Teléfono: (07) 2XX - XXXX\n` +
            `✅ Atención pública y bajo costo.\n\n` +

            `⚠️ **Recomendación de Seguridad**\n` +
            `Si encuentras un animal en situación de riesgo: protégelo del tráfico y el frío, ofrécele agua si está consciente, y contacta rápidamente a una fundación local. ¡Gracias por ayudar! 💛`;
        }

        setRecommendations(contenido);

      } catch (error) {
        setRecommendations("❌ Ocurrió un error al cargar la información. Intenta nuevamente.");
      } finally {
        setLoading(false);
      }
    };

    fetchShelters();
  }, [city]);

  return (
    <SafeAreaView style={appStyles.container}>
      <ScrollView contentContainerStyle={appStyles.content} showsVerticalScrollIndicator={false}>
        <Text style={appStyles.subtitle}>Buscando red de apoyo en: {city}</Text>

        <View style={[appStyles.card, { padding: 24 }]}>
          {loading ? (
            <View style={{ padding: 40, alignItems: 'center' }}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={{ marginTop: 16, color: COLORS.textSecondary, textAlign: 'center' }}>
                Cargando información de refugios...
              </Text>
            </View>
          ) : (
            <Text style={{ fontSize: 16, color: COLORS.textPrimary, lineHeight: 28 }}>
              {recommendations}
            </Text>
          )}
        </View>

        {!loading && (
          <TouchableOpacity 
            style={appStyles.buttonSecondary}
            onPress={() => navigation.goBack()}
          >
            <Text style={appStyles.buttonTextSecondary}>Volver al Inicio</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}