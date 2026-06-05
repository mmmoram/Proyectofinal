import { ref, push, set } from 'firebase/database';
import { db } from '../config/firebase'; 
import { petService } from './petService';

export const syncService = {
  async syncLocalToCloud(): Promise<void> {
    try {
      const unsyncedPets = await petService.getUnsyncedPets();
      
      if (unsyncedPets.length === 0) {
        console.log("No hay reportes pendientes de sincronización.");
        return;
      }

      console.log(`Iniciando sincronización de ${unsyncedPets.length} reportes...`);

      for (const pet of unsyncedPets) {
        if (!pet.localId) continue;

        // Limpiamos los datos locales antes de enviar a Firebase
        const { localId, synced, ...petData } = pet;

        // 1. Insertar en Realtime Database
        const petsRef = ref(db, 'pets');
        const newPetRef = push(petsRef);
        await set(newPetRef, petData);
        
        // 2. Marcar como sincronizado en SQLite local con el ID de Firebase
        await petService.markAsSynced(pet.localId, newPetRef.key || '');
      }
      
      console.log('Sincronización con Firebase completada exitosamente.');
    } catch (error) {
      console.error('Error crítico durante la sincronización:', error);
    }
  }
};