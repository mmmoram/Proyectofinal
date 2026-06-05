import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StatusBar, Image, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NavigationProps } from '../navigation/typesNavigation';
import { appStyles, COLORS } from '../styles/appStyles';
import * as Location from 'expo-location';

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProps>();
  const [currentCity, setCurrentCity] = useState<string>('Cuenca');
  const [activePet, setActivePet] = useState<'dog' | 'cat'>('dog');

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      
      try {
        let location = await Location.getCurrentPositionAsync({});
        let geocode = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        });
        if (geocode.length > 0 && geocode[0].city) {
          setCurrentCity(geocode[0].city);
        }
      } catch (error) {
        console.log("Usando ciudad por defecto.");
      }
    })();
  }, []);

  return (
    <SafeAreaView style={appStyles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F1F5F9" />
      
      {/* Fondo mejorado con formas decorativas */}
      <View style={styles.bgDecor1} />
      <View style={styles.bgDecor2} />
      
      <ScrollView contentContainerStyle={appStyles.content} showsVerticalScrollIndicator={false}>
        <View style={{ marginBottom: 32, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={[appStyles.title, { fontSize: 40 }]}>Salvando Huellas</Text>
            <Text style={[appStyles.subtitle, { color: COLORS.primary, fontWeight: '700' }]}>
              📍 {currentCity}
            </Text>
          </View>
          <TouchableOpacity 
            onPress={() => navigation.navigate('Profile')}
            style={{ 
              width: 60, height: 60, borderRadius: 20, backgroundColor: COLORS.white, 
              justifyContent: 'center', alignItems: 'center', elevation: 8, 
              shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10 
            }}
          >
            <Text style={{ fontSize: 30 }}>🐕</Text>
          </TouchableOpacity>
        </View>

        <View style={[appStyles.card, { alignItems: 'center', paddingVertical: 32, borderBottomWidth: 4, borderBottomColor: COLORS.primary, overflow: 'hidden' }]}>
          <TouchableOpacity 
            activeOpacity={0.8}
            onPress={() => setActivePet(activePet === 'dog' ? 'cat' : 'dog')}
            style={styles.interactiveImageContainer}
          >
            <Image 
              source={{ 
                uri: activePet === 'dog' 
                  ? 'https://img.freepik.com/vector-premium/perro-gato-estilo-geometrico-lineas_53876-115856.jpg'
                  : 'https://img.freepik.com/vector-premium/logo-animal-mascotas-perro-gato-geometrico_649646-1050.jpg'
              }} 
              style={{ width: 180, height: 180, borderRadius: 90 }}
              resizeMode="contain"
            />
            <View style={styles.tapBadge}>
              <Text style={{ fontSize: 10, color: COLORS.white, fontWeight: '900' }}>TOCA PARA CAMBIAR</Text>
            </View>
          </TouchableOpacity>
          
          <Text style={[appStyles.subtitle, { textAlign: 'center', marginBottom: 32, paddingHorizontal: 10, fontSize: 18, color: COLORS.textPrimary, fontWeight: '600' }]}>
            ¿Encontraste una mascota? {"\n"}Ayúdanos a encontrar un hogar.
          </Text>

          <View style={{ width: '100%', gap: 12 }}>
            <TouchableOpacity 
              style={appStyles.buttonPrimary}
              onPress={() => navigation.navigate('Form')}
            >
              <Text style={appStyles.buttonText}>📢 Reportar Mascota</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[appStyles.buttonSecondary, { marginTop: 0 }]}
              onPress={() => navigation.navigate('List')}
            >
              <Text style={appStyles.buttonTextSecondary}>🔍 Ver Rescates</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, gap: 16 }}>
          <TouchableOpacity 
            style={[appStyles.card, { flex: 1, marginVertical: 0, alignItems: 'center', padding: 20 }]}
            onPress={() => navigation.navigate('Stats')}
          >
            <View style={{ backgroundColor: COLORS.primaryLight, padding: 16, borderRadius: 24, marginBottom: 12 }}>
              <Text style={{ fontSize: 28 }}>📊</Text>
            </View>
            <Text style={{ fontWeight: '800', color: COLORS.textPrimary, fontSize: 15 }}>Estadísticas</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[appStyles.card, { flex: 1, marginVertical: 0, alignItems: 'center', padding: 20 }]}
            onPress={() => navigation.navigate('Shelters', { city: currentCity })}
          >
            <View style={{ backgroundColor: COLORS.secondaryLight, padding: 16, borderRadius: 24, marginBottom: 12 }}>
              <Text style={{ fontSize: 28 }}>🏥</Text>
            </View>
            <Text style={{ fontWeight: '800', color: COLORS.textPrimary, fontSize: 15 }}>Refugios</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  bgDecor1: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: COLORS.primaryLight,
    opacity: 0.5,
    zIndex: -1,
  },
  bgDecor2: {
    position: 'absolute',
    bottom: 100,
    left: -80,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: COLORS.secondaryLight,
    opacity: 0.3,
    zIndex: -1,
  },
  interactiveImageContainer: {
    width: 220,
    height: 220,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 110,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
  },
  tapBadge: {
    position: 'absolute',
    bottom: -5,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  }
});