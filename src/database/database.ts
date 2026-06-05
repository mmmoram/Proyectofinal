import * as SQLite from 'expo-sqlite';

let dbInstance: SQLite.SQLiteDatabase | null = null;
let isInitializing = false;

export const getDB = async (): Promise<SQLite.SQLiteDatabase> => {
  if (dbInstance) return dbInstance;

  while (isInitializing) {
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  if (!dbInstance) {
    isInitializing = true;
    try {
      dbInstance = await SQLite.openDatabaseAsync('huellas_salvo.db');
      await initDatabase(dbInstance);
    } finally {
      isInitializing = false;
    }
  }
  return dbInstance;
};

export const initDatabase = async (db: SQLite.SQLiteDatabase) => {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS pets (
      localId INTEGER PRIMARY KEY AUTOINCREMENT,
      id TEXT,
      species TEXT,
      breed TEXT,
      physicalState TEXT,
      latitude REAL,
      longitude REAL,
      address TEXT,
      imageUrl TEXT,
      reporterId TEXT,
      status TEXT,
      synced INTEGER DEFAULT 0,
      createdAt TEXT
    );
  `);
};