import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { PieChart, BarChart } from 'react-native-chart-kit';
import { appStyles, COLORS } from '../styles/appStyles';
import { petService } from '../services/petService';

const screenWidth = Dimensions.get('window').width - 64; // Margen considerado

export default function StatsScreen() {
  const [stats, setStats] = useState({
    total: 0,
    dogs: 0,
    cats: 0,
    others: 0,
    synced: 0,
    pending: 0
  });

  const loadStats = async () => {
    const data = await petService.getAllPets();
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
      pending: data.length - synced
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
    color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`,
    labelColor: (opacity = 1) => COLORS.textPrimary,
  };

  return (
    <SafeAreaView style={appStyles.container}>
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
    </SafeAreaView>
  );
}