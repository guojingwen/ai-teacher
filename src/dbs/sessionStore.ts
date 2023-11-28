import { MessageList, Session, SessionList } from '@/types';
import dbInstance from './db';
import {
  AUDIO_STORE,
  MESSAGE_STORE,
  SESSION_STORE,
} from '@/utils/constant';

const getAll = (
  objectStore: IDBObjectStore
): Promise<SessionList> => {
  const request = objectStore.openCursor();
  const list: SessionList = [];
  return new Promise((resolve) => {
    request.onsuccess = (e) => {
      let cursor = (e.target as any).result;
      if (cursor) {
        const item = cursor.value as Session;
        list.push(item);
        cursor.continue();
      } else {
        list.reverse();
        resolve(list);
      }
    };
  });
};
export const getSessions = async (): Promise<SessionList> => {
  const db = await dbInstance;
  const transaction = db.transaction([SESSION_STORE], 'readonly');
  const objectStore = transaction.objectStore(SESSION_STORE);
  return getAll(objectStore);
};
export const getSession = async (id: string): Promise<Session> => {
  const db = await dbInstance;
  const transaction = db.transaction([SESSION_STORE], 'readonly');
  const objectStore = transaction.objectStore(SESSION_STORE);
  const request = objectStore.get(id);
  return new Promise((resolve) => {
    request.onsuccess = (e: any) => {
      resolve(e.target.result);
    };
  });
};
export const addSession = async (
  session: Session
): Promise<SessionList> => {
  const db = await dbInstance;
  const transaction = db.transaction([SESSION_STORE], 'readwrite');
  const objectStore = transaction.objectStore(SESSION_STORE);
  const request = objectStore.add(session);
  await new Promise((resolve) => {
    request.onsuccess = (event) => {
      resolve(event);
    };
  });
  return getAll(objectStore);
};

export const updateSession = async (
  session: Session
): Promise<SessionList> => {
  const db = await dbInstance;
  const transaction = db.transaction([SESSION_STORE], 'readwrite');
  const objectStore = transaction.objectStore(SESSION_STORE);
  const request = objectStore.put(session);
  await new Promise((resolve) => {
    request.onsuccess = (event) => {
      resolve(event);
    };
  });
  return getAll(objectStore);
};
export const removeSession = async (id: string): Promise<void> => {
  const db = await dbInstance;
  const transaction = db.transaction(
    [SESSION_STORE, MESSAGE_STORE, AUDIO_STORE],
    'readwrite'
  );
  const objectStore = transaction.objectStore(SESSION_STORE);
  objectStore.delete(id)!;
  const objectStore2 = transaction.objectStore(MESSAGE_STORE);
  const request = objectStore2.getAll();
  const objectStore3 = transaction.objectStore(AUDIO_STORE);
  await new Promise((resolve) => {
    request.onsuccess = (e) => {
      let list = (e.target as IDBRequest<MessageList>).result;
      list.forEach((item) => {
        if (item.sessionId === id) {
          objectStore2.delete(item.id);
          if (item.audioKey) {
            objectStore3.delete(item.audioKey);
          }
        }
      });
      resolve(null);
    };
  });
};
