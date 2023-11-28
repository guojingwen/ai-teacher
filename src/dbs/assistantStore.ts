import type { AssistantList, Assistant } from '@/types';
import dbInstance from './db';
import { ASSISTANT_STORE } from '@/utils/constant';

const getAll = (
  objectStore: IDBObjectStore
): Promise<AssistantList> => {
  const request = objectStore.openCursor();
  const list: AssistantList = [];
  return new Promise((resolve) => {
    request.onsuccess = (e) => {
      let cursor = (e.target as any).result;
      if (cursor) {
        list.push(cursor.value as Assistant);
        cursor.continue();
      } else {
        // 所有的object都在results里面
        resolve(list);
      }
    };
  });
};
const getList = async (): Promise<AssistantList> => {
  const db = await dbInstance;
  // indexedDB 里面，强制规定了，任何读写操作，都必须在一个事务中进行
  const transaction = db.transaction([ASSISTANT_STORE], 'readonly');
  const objectStore = transaction.objectStore(ASSISTANT_STORE);
  return getAll(objectStore);
};

const addAssistant = async (
  assistant: Assistant
): Promise<AssistantList> => {
  const db = await dbInstance;
  const transaction = db.transaction([ASSISTANT_STORE], 'readwrite');
  const objectStore = transaction.objectStore(ASSISTANT_STORE);
  objectStore.add(assistant);
  return getAll(objectStore);
};

const updateAssistant = async (
  id: string,
  data: Partial<Omit<Assistant, 'id'>>
): Promise<AssistantList> => {
  const db = await dbInstance;
  const transaction = db.transaction([ASSISTANT_STORE], 'readwrite');
  const objectStore = transaction.objectStore(ASSISTANT_STORE);
  objectStore.put({
    ...data,
    id,
  });
  return getAll(objectStore);
};
const removeAssistant = async (
  id: string
): Promise<AssistantList> => {
  const db = await dbInstance;
  const transaction = db.transaction([ASSISTANT_STORE], 'readwrite');
  const objectStore = transaction.objectStore(ASSISTANT_STORE);
  objectStore.delete(id);
  return getAll(objectStore);
};

const getAssistant = async (
  id: string
): Promise<Assistant | null> => {
  const db = await dbInstance;
  const transaction = db.transaction([ASSISTANT_STORE], 'readwrite');
  const objectStore = transaction.objectStore(ASSISTANT_STORE);
  let request = objectStore.get(id);
  return new Promise((resolve) => {
    request.onsuccess = (e: any) => {
      resolve(e.target.result);
    };
  });
};

export {
  getList,
  addAssistant,
  updateAssistant,
  removeAssistant,
  getAssistant,
};
