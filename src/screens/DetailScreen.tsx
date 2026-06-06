import React, { useState, useCallback } from 'react';
import { View, Text, Image, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, RouteProp, useNavigation, useFocusEffect } from '@react-navigation/native';
import { RootStackParamList, NavigationProps } from '../navigation/typesNavigation';
import { appStyles, COLORS } from '../styles/appStyles';
import { petService } from '../services/petService';
import { syncService } from '../services/syncService';
import { PetReport } from '../types/pet';

type DetailScreenRouteProp = RouteProp<RootStackParamList, 'Detail'>;

export default function DetailScreen() {
  const route = useRoute<DetailScreenRouteProp>();
  const navigation = useNavigation<NavigationProps>();
  const { petId } = route.params;

  const [pet, setPet] = useState<PetReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const loadPetData = async () => {
    setLoading(true);
    try {
      const data = await petService.getPetById(petId);
      setPet(data);
    } catch (error) {
      console.error("Error al cargar detalles:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await syncService.syncLocalToCloud();
      await loadPetData();
      Alert.alert("Éxito", "Los datos se han sincronizado con Firebase.");
    } catch (error) {
      Alert.alert("Error", "No se pudo sincronizar. Verifica tu conexión.");
    } finally {
      setSyncing(false);
    }
  };

  const updateStatus = async (newStatus: string) => {
    try {
      await petService.updateStatus(petId, newStatus);
      await loadPetData();
      Alert.alert("Actualizado", `El estado ha cambiado a: ${newStatus}`);
    } catch (error) {
      Alert.alert("Error", "No se pudo actualizar el estado.");
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadPetData();
    }, [petId])
  );

  if (loading) {
    return (
      <SafeAreaView style={[appStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  if (!pet) {
    return (
      <SafeAreaView style={[appStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: COLORS.textSecondary }}>No se encontró el reporte.</Text>
        <TouchableOpacity style={appStyles.buttonPrimary} onPress={() => navigation.goBack()}>
          <Text style={appStyles.buttonText}>Volver</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={appStyles.container}>
      <ScrollView contentContainerStyle={appStyles.content} showsVerticalScrollIndicator={false}>
        <View style={[appStyles.card, { padding: 12 }]}>
          {pet.imageUrl ? (
            <Image source={{ uri: pet.imageUrl }} style={{ width: '100%', height: 300, borderRadius: 20, marginBottom: 16 }} />
          ) : (
            <View style={{ width: '100%', height: 250, backgroundColor: '#E2E8F0', borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ color: COLORS.textSecondary }}>Sin imagen disponible</Text>
            </View>
          )}

          <View style={{ padding: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ fontSize: 24, fontWeight: '900', color: COLORS.textPrimary }}>
                {pet.species} - {pet.breed}
              </Text>
              <View style={{ 
                paddingHorizontal: 12, paddingVertical: 6, 
                backgroundColor: pet.status === 'Rescatado' ? '#D1FAE5' : '#FEF3C7',
                borderRadius: 10,
                marginLeft: 10,   
                marginRight: 0 
              }}>
                <Text style={{ 
                  color: pet.status === 'Rescatado' ? '#059669' : '#D97706', 
                  fontWeight: '800', fontSize: 11
                }}>
                  {pet.status.toUpperCase()}
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 20 }}>
              <TouchableOpacity 
                style={[appStyles.buttonPrimary, { flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: COLORS.secondary }]}
                onPress={() => updateStatus('Rescatado')}
              >
                <Text style={{ color: COLORS.white, fontWeight: '800', fontSize: 12 }}>MARCAR RESCATADO</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[appStyles.buttonPrimary, { flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: COLORS.accent }]}
                onPress={() => updateStatus('Reportado')}
              >
                <Text style={{ color: COLORS.white, fontWeight: '800', fontSize: 12 }}>MARCAR PENDIENTE</Text>
              </TouchableOpacity>
            </View>

            <Text style={{ fontSize: 14, color: COLORS.textSecondary, marginBottom: 20 }}>
              📅 Reportado el {new Date(pet.createdAt).toLocaleDateString()}
            </Text>

            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontWeight: '800', fontSize: 17, color: COLORS.textPrimary, marginBottom: 6 }}>Estado Físico (IA)</Text>
              <View style={{ backgroundColor: '#F8FAFC', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#EDF2F7' }}>
                <Text style={{ fontSize: 16, color: COLORS.textSecondary, lineHeight: 26 }}>
                  {pet.physicalState}
                </Text>
              </View>
            </View>

            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontWeight: '800', fontSize: 17, color: COLORS.textPrimary, marginBottom: 6 }}>Ubicación</Text>
              <Text style={{ fontSize: 16, color: COLORS.textSecondary, lineHeight: 24 }}>
                📍 {pet.address}
              </Text>
            </View>

            <View style={{ padding: 16, backgroundColor: pet.synced ? '#F0FDF4' : '#FFF1F2', borderRadius: 14, borderWidth: 1, borderColor: pet.synced ? '#DCFCE7' : '#FFE4E6', marginBottom: 20 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                <View style={{ 
                  width: 12, height: 12, borderRadius: 6, 
                  backgroundColor: pet.synced ? COLORS.secondary : COLORS.danger,
                  marginRight: 10
                }} />
                <Text style={{ fontSize: 14, fontWeight: '700', color: COLORS.textPrimary }}>
                  {pet.synced ? 'Sincronizado con Firebase' : 'Modo Offline (Solo Local)'}
                </Text>
              </View>
              
              {!pet.synced && (
                <TouchableOpacity 
                  style={{ backgroundColor: COLORS.primary, padding: 10, borderRadius: 10, alignItems: 'center' }}
                  onPress={handleSync}
                  disabled={syncing}
                >
                  {syncing ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '800' }}>☁️ SINCRONIZAR AHORA</Text>}
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity 
              style={[appStyles.buttonSecondary, { marginTop: 10 }]}
              onPress={() => navigation.goBack()}
            >
              <Text style={appStyles.buttonTextSecondary}>Volver a la lista</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}