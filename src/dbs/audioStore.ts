import dbInstance from './db';
import { AUDIO_STORE } from '@/utils/constant';

export const addAudio = async (
  audioBase64: string
): Promise<number> => {
  const db = await dbInstance;
  const transaction = db.transaction([AUDIO_STORE], 'readwrite');
  const objectStore = transaction.objectStore(AUDIO_STORE);
  const request = objectStore.add(audioBase64);
  return new Promise((resolve) => {
    request.onsuccess = (e: any) => {
      resolve(e.target.result);
    };
  });
};

export const getAudio = async (key: number): Promise<string> => {
  const db = await dbInstance;
  const transaction = db.transaction([AUDIO_STORE], 'readonly');
  const objectStore = transaction.objectStore(AUDIO_STORE);
  const request = objectStore.get(key);
  return new Promise((resolve) => {
    request.onsuccess = (e: any) => {
      resolve(e.target.result);
    };
  });
};

export const removeAudio = async (key: number): Promise<void> => {
  const db = await dbInstance;
  const transaction = db.transaction([AUDIO_STORE], 'readwrite');
  const objectStore = transaction.objectStore(AUDIO_STORE);
  const request = objectStore.delete(key);
  return new Promise((resolve) => {
    request.onsuccess = (e) => {
      resolve();
    };
  });
};
