export interface PetReport {
  id?: string; // Firebase ID
  localId?: number; // SQLite ID
  species: 'Perro' | 'Gato' | 'Otro';
  breed: string;
  physicalState: string;
  latitude: number;
  longitude: number;
  address: string;
  imageUrl: string;
  reporterId: string;
  status: 'Reportado' | 'Rescatado';
  synced: boolean;
  createdAt: string;
}

export interface AiAnalysisResult {
  species: 'Perro' | 'Gato' | 'Otro';
  breed: string;
  physicalState: string;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  reportCount: number;
  badge: 'Novato' | 'Rescatista' | 'Héroe';
}