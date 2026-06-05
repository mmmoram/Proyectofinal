import { getDB } from '../database/database';
import { PetReport } from '../types/pet';

export const petService = {
  async addPet(pet: PetReport): Promise<number> {
    const db = await getDB();
    const result = await db.runAsync(
      `INSERT INTO pets (species, breed, physicalState, latitude, longitude, address, imageUrl, reporterId, status, synced, createdAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        pet.species,
        pet.breed,
        pet.physicalState,
        pet.latitude,
        pet.longitude,
        pet.address,
        pet.imageUrl,
        pet.reporterId,
        pet.status,
        pet.synced ? 1 : 0,
        pet.createdAt || new Date().toISOString()
      ]
    );
    return result.lastInsertRowId;
  },

  async getAllPets(): Promise<PetReport[]> {
    const db = await getDB();
    const rows = await db.getAllAsync<any>(
      `SELECT * FROM pets ORDER BY createdAt DESC`
    );
    return rows.map(row => ({
      ...row,
      synced: row.synced === 1
    }));
  },

  async getUnsyncedPets(): Promise<PetReport[]> {
    const db = await getDB();
    const rows = await db.getAllAsync<any>(
      `SELECT * FROM pets WHERE synced = 0`
    );
    return rows.map(row => ({
      ...row,
      synced: false
    }));
  },

  async getPetById(localId: number): Promise<PetReport | null> {
    const db = await getDB();
    const result = await db.getFirstAsync<any>(
      `SELECT * FROM pets WHERE localId = ?`,
      [localId]
    );
    
    if (!result) return null;
    
    return {
      ...result,
      synced: result.synced === 1
    };
  },

  async updateStatus(localId: number, newStatus: string): Promise<void> {
    const db = await getDB();
    await db.runAsync(
      `UPDATE pets SET status = ?, synced = 0 WHERE localId = ?`,
      [newStatus, localId]
    );
  },

  async markAsSynced(localId: number, firebaseId: string): Promise<void> {
    const db = await getDB();
    await db.runAsync(
      `UPDATE pets SET synced = 1, id = ? WHERE localId = ?`,
      [firebaseId, localId]
    );
  }
};