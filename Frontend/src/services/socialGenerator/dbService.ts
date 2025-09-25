import type { GeneratedImage } from '../../types/socialGenerator';

const DB_NAME = 'SocialGraphicGeneratorDB';
const DB_VERSION = 1;
const STORE_NAME = 'generated_images';

let db: IDBDatabase | null = null;

const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (db) {
      return resolve(db);
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('IndexedDB error:', request.error);
      reject('Error opening database');
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const dbInstance = (event.target as IDBOpenDBRequest).result;
      if (!dbInstance.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = dbInstance.createObjectStore(STORE_NAME, { keyPath: 'id' });
        objectStore.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };
  });
};

export const addImage = async (image: GeneratedImage): Promise<void> => {
  const dbInstance = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = dbInstance.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.add(image);

    request.onsuccess = () => resolve();
    request.onerror = () => {
        console.error('Error adding image to DB:', request.error);
        reject(request.error);
    };
  });
};

export const getAllImages = async (): Promise<GeneratedImage[]> => {
  const dbInstance = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = dbInstance.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
        resolve(request.result as GeneratedImage[]);
    };
    request.onerror = () => {
        console.error('Error getting images from DB:', request.error);
        reject(request.error);
    };
  });
};