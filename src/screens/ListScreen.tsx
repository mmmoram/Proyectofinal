import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NavigationProps } from '../navigation/typesNavigation';
import { appStyles, COLORS } from '../styles/appStyles';
import { petService } from '../services/petService';
import { PetReport } from '../types/pet';

export default function ListScreen() {
  const navigation = useNavigation<NavigationProps>();
  const [pets, setPets] = useState<PetReport[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPets = async () => {
    setLoading(true);
    try {
      const data = await petService.getAllPets();
      setPets(data);
    } catch (error) {
      console.error("Error cargando mascotas:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadPets();
    }, [])
  );

  const renderItem = ({ item }: { item: PetReport }) => (
    <TouchableOpacity 
      style={[appStyles.card, { flexDirection: 'row', padding: 12 }]}
      onPress={() => item.localId && navigation.navigate('Detail', { petId: item.localId })}
    >
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={{ width: 80, height: 80, borderRadius: 12 }} />
      ) : (
        <View style={{ width: 80, height: 80, borderRadius: 12, backgroundColor: '#E2E8F0' }} />
      )}
      
      <View style={{ marginLeft: 16, flex: 1, justifyContent: 'center' }}>
        <Text style={{ fontSize: 18, fontWeight: '700', color: COLORS.textPrimary }}>
          {item.species} - {item.breed}
        </Text>
        <Text style={{ fontSize: 14, color: COLORS.textSecondary, marginTop: 4 }} numberOfLines={2}>
          📍 {item.address}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
          <View style={{ 
            width: 10, height: 10, borderRadius: 5, 
            backgroundColor: item.synced ? COLORS.secondary : COLORS.danger,
            marginRight: 6
          }} />
          <Text style={{ fontSize: 12, color: COLORS.textSecondary }}>
            {item.synced ? 'Sincronizado' : 'Pendiente (Offline)'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={appStyles.container}>
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : pets.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
          <Text style={{ fontSize: 50, marginBottom: 20 }}>🐾</Text>
          <Text style={{ textAlign: 'center', color: COLORS.textSecondary, fontSize: 18, fontWeight: '600' }}>
            No hay reportes registrados aún.
          </Text>
          <TouchableOpacity 
            style={[appStyles.buttonPrimary, { marginTop: 30, width: '100%' }]}
            onPress={() => navigation.navigate('Form')}
          >
            <Text style={appStyles.buttonText}>Hacer primer reporte</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={pets}
          keyExtractor={(item) => (item.localId ? item.localId.toString() : Math.random().toString())}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[appStyles.content, { paddingBottom: 40 }]}
        />
      )}
    </SafeAreaView>
  );
}