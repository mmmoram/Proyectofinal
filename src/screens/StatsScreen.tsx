import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { PieChart } from 'react-native-chart-kit';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { appStyles, COLORS } from '../styles/appStyles';
import { petService } from '../services/petService';
import { PetReport } from '../types/pet';

const screenWidth = Dimensions.get('window').width - 64;

const MARKER_COLORS: Record<string, string> = {
  perro: COLORS.primary,
  gato: COLORS.secondary,
  default: '#F59E0B',
};

function getMarkerColor(species: string): string {
  const s = species.toLowerCase();
  if (s.includes('perro')) return MARKER_COLORS.perro;
  if (s.includes('gato')) return MARKER_COLORS.gato;
  return MARKER_COLORS.default;
}

export default function StatsScreen() {
  const [activeTab, setActiveTab] = useState<'stats' | 'map'>('stats');
  const [pets, setPets] = useState<PetReport[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    dogs: 0,
    cats: 0,
    others: 0,
    synced: 0,
    pending: 0,
  });

  const loadStats = async () => {
    const data = await petService.getAllPets();
    setPets(data);

    let dogs = 0, cats = 0, others = 0, synced = 0;
    data.forEach(pet => {
      const species = pet.species.toLowerCase().trim();
      if (species.includes('perro')) dogs++;
      else if (species.includes('gato')) cats++;
      else others++;
      if (pet.synced) synced++;
    });

    setStats({
      total: data.length,
      dogs,
      cats,
      others,
      synced,
      pending: data.length - synced,
    });
  };

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [])
  );

  const pieData = [
    { name: 'Perros', population: stats.dogs, color: COLORS.primary, legendFontColor: COLORS.textPrimary, legendFontSize: 14 },
    { name: 'Gatos', population: stats.cats, color: COLORS.secondary, legendFontColor: COLORS.textPrimary, legendFontSize: 14 },
    { name: 'Otros', population: stats.others, color: '#F59E0B', legendFontColor: COLORS.textPrimary, legendFontSize: 14 },
  ];

  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (op = 1) => `rgba(79, 70, 229, ${op})`,
    labelColor: () => COLORS.textPrimary,
  };

  const petsWithLocation = pets.filter(p => p.latitude !== 0 && p.longitude !== 0);

  const mapRegion = petsWithLocation.length > 0
    ? {
        latitude: petsWithLocation[0].latitude,
        longitude: petsWithLocation[0].longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }
    : {
        latitude: -2.897,
        longitude: -79.005,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      };

  return (
    <SafeAreaView style={appStyles.container}>
      {/* Tab switcher */}
      <View style={{
        flexDirection: 'row',
        marginHorizontal: 16,
        marginTop: 8,
        marginBottom: 4,
        backgroundColor: '#F1F5F9',
        borderRadius: 12,
        padding: 4,
      }}>
        <TouchableOpacity
          style={{
            flex: 1,
            paddingVertical: 10,
            borderRadius: 10,
            alignItems: 'center',
            backgroundColor: activeTab === 'stats' ? COLORS.white : 'transparent',
            shadowColor: activeTab === 'stats' ? '#000' : 'transparent',
            shadowOpacity: activeTab === 'stats' ? 0.08 : 0,
            shadowRadius: 4,
            elevation: activeTab === 'stats' ? 2 : 0,
          }}
          onPress={() => setActiveTab('stats')}
        >
          <Text style={{ fontWeight: '700', color: activeTab === 'stats' ? COLORS.primary : COLORS.textSecondary, fontSize: 14 }}>
            Estadísticas
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            flex: 1,
            paddingVertical: 10,
            borderRadius: 10,
            alignItems: 'center',
            backgroundColor: activeTab === 'map' ? COLORS.white : 'transparent',
            shadowColor: activeTab === 'map' ? '#000' : 'transparent',
            shadowOpacity: activeTab === 'map' ? 0.08 : 0,
            shadowRadius: 4,
            elevation: activeTab === 'map' ? 2 : 0,
          }}
          onPress={() => setActiveTab('map')}
        >
          <Text style={{ fontWeight: '700', color: activeTab === 'map' ? COLORS.primary : COLORS.textSecondary, fontSize: 14 }}>
            Mapa de Mascotas
          </Text>
        </TouchableOpacity>
      </View>

      {/* Stats tab */}
      {activeTab === 'stats' && (
        <ScrollView contentContainerStyle={appStyles.content} showsVerticalScrollIndicator={false}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
            <View style={[appStyles.card, { flex: 1, marginRight: 8, alignItems: 'center' }]}>
              <View style={{ backgroundColor: '#EEF2FF', padding: 12, borderRadius: 16, marginBottom: 8 }}>
                <Text style={{ fontSize: 24 }}>📈</Text>
              </View>
              <Text style={{ fontSize: 32, fontWeight: '800', color: COLORS.primary }}>{stats.total}</Text>
              <Text style={{ fontSize: 13, color: COLORS.textSecondary, fontWeight: '600' }}>Total Reportes</Text>
            </View>
            <View style={[appStyles.card, { flex: 1, marginLeft: 8, alignItems: 'center' }]}>
              <View style={{ backgroundColor: '#ECFDF5', padding: 12, borderRadius: 16, marginBottom: 8 }}>
                <Text style={{ fontSize: 24 }}>☁️</Text>
              </View>
              <Text style={{ fontSize: 32, fontWeight: '800', color: COLORS.secondary }}>{stats.synced}</Text>
              <Text style={{ fontSize: 13, color: COLORS.textSecondary, fontWeight: '600' }}>Sincronizados</Text>
            </View>
          </View>

          <View style={[appStyles.card, { padding: 24 }]}>
            <Text style={{ fontWeight: '800', fontSize: 18, marginBottom: 20, color: COLORS.textPrimary }}>Distribución por Especie</Text>
            <PieChart
              data={pieData}
              width={screenWidth}
              height={220}
              chartConfig={chartConfig}
              accessor={"population"}
              backgroundColor={"transparent"}
              paddingLeft={"15"}
              absolute
            />
          </View>

          <View style={[appStyles.card, { marginTop: 10, padding: 20, backgroundColor: COLORS.primary }]}>
            <Text style={{ color: COLORS.white, fontSize: 18, fontWeight: '800', marginBottom: 8 }}>Resumen de Actividad</Text>
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, lineHeight: 22 }}>
              Has contribuido a identificar a {stats.total} mascotas. ¡Tu ayuda es fundamental para mejorar las estadísticas de bienestar animal en tu ciudad!
            </Text>
          </View>
        </ScrollView>
      )}

      {/* Map tab */}
      {activeTab === 'map' && (
        <View style={{ flex: 1, marginTop: 8 }}>
          {petsWithLocation.length === 0 ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
              <Text style={{ fontSize: 48, marginBottom: 16 }}>🗺️</Text>
              <Text style={{ fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, textAlign: 'center', marginBottom: 8 }}>
                Sin ubicaciones registradas
              </Text>
              <Text style={{ color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22 }}>
                Los reportes con ubicación GPS aparecerán aquí como marcadores en el mapa.
              </Text>
            </View>
          ) : (
            <>
              <MapView
                style={{ flex: 1 }}
                provider={PROVIDER_DEFAULT}
                initialRegion={mapRegion}
                showsUserLocation
                showsMyLocationButton
              >
                {petsWithLocation.map((pet, index) => (
                  <Marker
                    key={pet.localId ?? index}
                    coordinate={{ latitude: pet.latitude, longitude: pet.longitude }}
                    title={`${pet.species} - ${pet.breed}`}
                    description={`Estado: ${pet.physicalState} | ${pet.status}`}
                    pinColor={getMarkerColor(pet.species)}
                  />
                ))}
              </MapView>

              {/* Leyenda */}
              <View style={{
                position: 'absolute',
                bottom: 16,
                left: 16,
                right: 16,
                backgroundColor: COLORS.white,
                borderRadius: 12,
                padding: 12,
                flexDirection: 'row',
                justifyContent: 'space-around',
                elevation: 4,
                shadowColor: '#000',
                shadowOpacity: 0.1,
                shadowRadius: 6,
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.primary, marginRight: 6 }} />
                  <Text style={{ fontSize: 12, color: COLORS.textPrimary, fontWeight: '600' }}>Perros ({stats.dogs})</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.secondary, marginRight: 6 }} />
                  <Text style={{ fontSize: 12, color: COLORS.textPrimary, fontWeight: '600' }}>Gatos ({stats.cats})</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#F59E0B', marginRight: 6 }} />
                  <Text style={{ fontSize: 12, color: COLORS.textPrimary, fontWeight: '600' }}>Otros ({stats.others})</Text>
                </View>
              </View>
            </>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}
