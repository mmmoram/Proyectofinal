import React, { useState, useCallback } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NavigationProps } from '../navigation/typesNavigation';
import { appStyles, COLORS } from '../styles/appStyles';
import { petService } from '../services/petService';

export default function ProfileScreen() {
  const navigation = useNavigation<NavigationProps>();
  const [reportCount, setReportCount] = useState(0);

  const loadUserData = async () => {
    // En un flujo real, aquí llamarías a getAuth() de Firebase.
    // Para la gamificación local, contamos los registros en SQLite.
    const allPets = await petService.getAllPets();
    setReportCount(allPets.length);
  };

  useFocusEffect(
    useCallback(() => {
      loadUserData();
    }, [])
  );

  const getBadge = (count: number) => {
    if (count >= 10) return { title: 'Héroe de 4 Patas 🦸‍♂️', color: '#F59E0B' }; // Gold
    if (count >= 5) return { title: 'Rescatista Activo 🛡️', color: COLORS.primary };
    return { title: 'Novato 🌱', color: COLORS.secondary };
  };

  const badge = getBadge(reportCount);

  return (
    <SafeAreaView style={appStyles.container}>
      <ScrollView contentContainerStyle={appStyles.content}>
        <View style={[appStyles.card, { alignItems: 'center', paddingVertical: 40 }]}>
          <Image 
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' }} 
            style={{ width: 100, height: 100, borderRadius: 50, marginBottom: 16 }}
          />
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: COLORS.textPrimary }}>Usuario Solidario</Text>
          <Text style={{ fontSize: 16, color: COLORS.textSecondary, marginBottom: 24 }}>usuario@huellas.com</Text>

          <View style={{ 
            backgroundColor: badge.color + '20', // 20% opacity
            paddingHorizontal: 20, 
            paddingVertical: 10, 
            borderRadius: 20,
            borderWidth: 1,
            borderColor: badge.color
          }}>
            <Text style={{ color: badge.color, fontWeight: '800', fontSize: 16 }}>
              {badge.title}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
          <View style={[appStyles.card, { flex: 1, marginRight: 8, alignItems: 'center' }]}>
            <Text style={{ fontSize: 32, fontWeight: '800', color: COLORS.textPrimary }}>{reportCount}</Text>
            <Text style={{ fontSize: 14, color: COLORS.textSecondary, textAlign: 'center' }}>Mascotas Reportadas</Text>
          </View>
          <View style={[appStyles.card, { flex: 1, marginLeft: 8, alignItems: 'center', justifyContent: 'center' }]}>
            <Text style={{ fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', marginBottom: 8 }}>
              Próximo nivel en:
            </Text>
            <Text style={{ fontSize: 18, fontWeight: '700', color: COLORS.primary }}>
              {reportCount < 5 ? 5 - reportCount : reportCount < 10 ? 10 - reportCount : 'Max'} reportes
            </Text>
          </View>
        </View>

        <TouchableOpacity 
          style={[appStyles.buttonPrimary, { backgroundColor: COLORS.danger, marginTop: 40, marginBottom: 20 }]}
          onPress={() => {
            // Aquí iría el logout de Firebase si se estuviera usando Auth.
            // navigation.dispatch(StackActions.replace('Login')) o similar.
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          }}
        >
          <Text style={appStyles.buttonText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}