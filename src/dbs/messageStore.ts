import { Message, MessageList } from '@/types';
import dbInstance from './db';
import { MESSAGE_STORE } from '@/utils/constant';

const getAllMsgsBySessionId = (
  objectStore: IDBObjectStore,
  sessionId: string
): Promise<MessageList> => {
  const request = objectStore.openCursor();
  const list: MessageList = [];
  return new Promise((resolve) => {
    request.onsuccess = (e) => {
      let cursor = (e.target as any).result;
      if (cursor) {
        const item = cursor.value as Message;
        if (item.sessionId === sessionId) {
          list.push(item);
        }
        cursor.continue();
      } else {
        resolve(list);
      }
    };
  });
};
export const getMessages = async (id: string) => {
  const db = await dbInstance;
  const transaction = db.transaction([MESSAGE_STORE], 'readonly');
  const objectStore = transaction.objectStore(MESSAGE_STORE);
  return getAllMsgsBySessionId(objectStore, id);
};
export const addMessage = async (msg: Message): Promise<void> => {
  await updateMessage(msg, 'add');
};
export const updateMessage = async (
  msg: Message,
  type: 'put' | 'add' = 'put'
): Promise<void> => {
  const db = await dbInstance;
  const _msg = {
    ...msg,
  };
  delete _msg.audioState; // 这个字段不入库
  const transaction = db.transaction([MESSAGE_STORE], 'readwrite');
  const objectStore = transaction.objectStore(MESSAGE_STORE);
  objectStore[type](_msg);
};
