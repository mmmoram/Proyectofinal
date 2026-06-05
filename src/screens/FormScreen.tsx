import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { NavigationProps } from '../navigation/typesNavigation';
import { appStyles, COLORS } from '../styles/appStyles';
import { analyzePetImage } from '../services/iaServices';
import { petService } from '../services/petService';
import { PetReport } from '../types/pet';

export default function FormScreen() {
  const navigation = useNavigation<NavigationProps>();
  
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState({
    species: '',
    breed: '',
    physicalState: '',
    address: '',
    latitude: 0,
    longitude: 0,
  });

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitamos acceso a la cámara para continuar.');
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        
        mediaTypes: ImagePicker.MediaTypeOptions.Images, 
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
        setImageBase64(result.assets[0].base64 || null);
        
        if (result.assets[0].base64) {
          handleAiAnalysis(result.assets[0].base64);
        } else {
          Alert.alert('Advertencia', 'No se pudo procesar la imagen tomada.');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Hubo un problema al abrir la cámara.');
    }
  };

   const handleAiAnalysis = async (base64: string) => {
    setIsAnalyzing(true);
    try {
      // 🧠 ANÁLISIS CON IA DE ALTA PRECISIÓN
      const aiData = await analyzePetImage(base64);
      
      // ✅ LLENAMOS LOS CAMPOS CON DATOS SEGUROS
      setForm(prev => ({
        ...prev,
        species: aiData.species.trim(),
        breed: aiData.breed.trim(),
        physicalState: aiData.physicalState.trim(),
      }));

      Alert.alert('✅ ¡Listo!', `Detectado: ${aiData.species} - ${aiData.breed}`);

    } catch (error: any) {
      console.error("Error:", error);
      Alert.alert('⚠️ Información', 'No se detectaron detalles, puedes completar tú mismo.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitamos acceso a tu ubicación para registrar el reporte.');
      return;
    }

    try {
      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const geocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });

      if (geocode.length > 0) {
        const place = geocode[0];
        const direccionCompleta = `${place.street || ''} ${place.streetNumber || ''}, ${place.city || ''}, ${place.region || ''}`.trim();
        
        setForm(prev => ({
          ...prev,
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          address: direccionCompleta || "Ubicación aproximada registrada"
        }));
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo obtener tu ubicación.');
    }
  };

  const handleSave = async () => {
    if (!form.species.trim() || !form.address.trim() || !imageUri) {
      Alert.alert('⚠️ Faltan datos', 'Debes completar al menos: Especie, Ubicación y tomar una foto.');
      return;
    }

    setIsSaving(true);
    try {
      const newReport: PetReport = {
        species: form.species as any,
        breed: form.breed || "Sin especificar",
        physicalState: form.physicalState || "Sin descripción",
        latitude: form.latitude,
        longitude: form.longitude,
        address: form.address,
        imageUrl: imageUri,
        reporterId: 'USER_ID_MOCK',
        status: 'Reportado',
        synced: false,
        createdAt: new Date().toISOString()
      };

      await petService.addPet(newReport);
      Alert.alert('✅ ¡Éxito!', 'Reporte guardado con éxito.', [
        { text: 'Ir al Inicio', onPress: () => navigation.navigate('Home') }
      ]);
    } catch (error) {
      console.error(error);
      Alert.alert('❌ Error', 'No se pudo guardar el reporte.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={appStyles.container}>
      <ScrollView contentContainerStyle={appStyles.content} showsVerticalScrollIndicator={false}>
        <View style={appStyles.card}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={{ width: '100%', height: 250, borderRadius: 16, marginBottom: 16 }} />
          ) : (
            <View style={{ width: '100%', height: 200, backgroundColor: '#E2E8F0', borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 16, borderStyle: 'dashed', borderWidth: 2, borderColor: COLORS.border }}>
              <Text style={{ color: COLORS.textSecondary, fontSize: 16 }}>Sube una foto de la mascota</Text>
            </View>
          )}

          <TouchableOpacity style={appStyles.buttonPrimary} onPress={takePhoto} disabled={isAnalyzing}>
            <Text style={appStyles.buttonText}>📸 Tomar Foto</Text>
          </TouchableOpacity>
        </View>

        {isAnalyzing && (
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 10, backgroundColor: COLORS.white, padding: 12, borderRadius: 12, elevation: 2 }}>
            <ActivityIndicator color={COLORS.primary} style={{ marginRight: 8 }} size="small" />
            <Text style={{ color: COLORS.primary, fontWeight: '700' }}>🤖 Analizando imagen...</Text>
          </View>
        )}

        <Text style={[appStyles.subtitle, { fontWeight: '700', marginTop: 10, color: COLORS.textPrimary }]}>Información de la Mascota</Text>
        
        <View style={appStyles.card}>
          <TextInput
            style={appStyles.input}
            placeholder="Especie (Perro, Gato...)"
            placeholderTextColor={COLORS.textSecondary}
            value={form.species}
            onChangeText={(text) => setForm({...form, species: text})}
            editable={!isAnalyzing}
          />
          <TextInput
            style={appStyles.input}
            placeholder="Raza o Mestizo"
            placeholderTextColor={COLORS.textSecondary}
            value={form.breed}
            onChangeText={(text) => setForm({...form, breed: text})}
            editable={!isAnalyzing}
          />
          <TextInput
            style={[appStyles.input, { height: 100, textAlignVertical: 'top' }]}
            placeholder="Estado físico (Ej: Herido, hambriento...)"
            placeholderTextColor={COLORS.textSecondary}
            value={form.physicalState}
            onChangeText={(text) => setForm({...form, physicalState: text})}
            multiline
            editable={!isAnalyzing}
          />
        </View>

        <Text style={[appStyles.subtitle, { fontWeight: '700', marginTop: 10, color: COLORS.textPrimary }]}>Ubicación</Text>
        
        <View style={appStyles.card}>
          <TouchableOpacity style={[appStyles.buttonSecondary, { marginTop: 0, marginBottom: 16, borderColor: '#3B82F6' }]} onPress={getLocation}>
            <Text style={[appStyles.buttonTextSecondary, { color: '#3B82F6' }]}>📍 Obtener ubicación actual</Text>
          </TouchableOpacity>

          <TextInput
            style={[appStyles.input, { marginBottom: 0 }]}
            placeholder="Dirección aproximada"
            placeholderTextColor={COLORS.textSecondary}
            value={form.address}
            onChangeText={(text) => setForm({...form, address: text})}
          />
        </View>

        <TouchableOpacity 
          style={[appStyles.buttonPrimary, { marginTop: 20, marginBottom: 40 }]} 
          onPress={handleSave}
          disabled={isSaving || isAnalyzing}
        >
          {isSaving ? <ActivityIndicator color={COLORS.white} /> : <Text style={appStyles.buttonText}>🚀 Publicar Reporte</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}