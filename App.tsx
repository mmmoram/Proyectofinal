import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ActivityIndicator, View } from 'react-native';
import { StackNavigator } from './src/navigation/StackNavigator';
import { getDB } from './src/database/database';
import { AuthProvider } from './src/context/AuthContext'; 

export default function App() {
  const [isDbReady, setIsDbReady] = useState(false);

  useEffect(() => {
    async function setupDatabase() {
      console.log("Iniciando DB...");
      try {
        await getDB();
        console.log("DB lista");
        setIsDbReady(true);
      } catch (e) {
        console.error("Error inicializando la base de datos:", e);
       
        setIsDbReady(true); 
      }
    }
    setupDatabase();
  }, []);

  if (!isDbReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <StackNavigator />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}