/**
 * indexedDB 的相对于localStorage的优势
 * - 支持异步、存储容量大、支持事务索引等、支持多种数据格式
 * - 可以在同源的多个线程里执行，localStorage只能在主线程中执行
 * indexedDB 与 localStorage的相同点
 * - 遵循同源策略
 *
 * indexedDB的特点
 * - 键值对存储 json格式天然对JS友好
 * - 异步支持事务
 * - 同源限制
 * - 存储空间大 500M
 * - 支持String Number 对象、数组、Date、File、blob、arraybuffer、二进制等
 *
 * indexedDB相关概念
 * - 数据库： IDBDatabase
 * - 对象仓库： IDBObjectStore
 * - 索引： IDBIndex对象
 * - 事务：IDBTransaction
 * - IDBRequest
 * - IDBCursor
 * - IDBKeyRange
 */

import {
  ASSISTANT_ID,
  ASSISTANT_STORE,
  AUDIO_STORE,
  EMPTY_SESSION_ID,
  MESSAGE_STORE,
  SESSION_STORE,
} from '@/utils/constant';
import assistants from './initAssistant';

let _resolve: (value: IDBDatabase) => any,
  _reject: (value: unknown) => any;
let dbInstance: Promise<IDBDatabase> = new Promise(
  (resolve, reject) => {
    _resolve = resolve;
    _reject = reject;
  }
);
const request = window.indexedDB.open('english-assistant2', 2);
request.onerror = function (event) {
  console.log('onerror', event);
  _reject(event);
  console.log('数据库打开报错');
};

// 如果当前数据版本大于实际数据库版本，就会发生数据库升级事件
request.onupgradeneeded = function (event) {
  console.log('onupgradeneeded', event);
  // 这里可以修改数据库结构（新增或删除表、索引或者主键)
  // 注意： 所有与表结构相关的都要写在这里
  const db = (event.target as any).result as IDBDatabase;
  const names = db.objectStoreNames;
  if (!names.contains(ASSISTANT_STORE)) {
    db.createObjectStore(ASSISTANT_STORE, {
      keyPath: 'id',
    });
    db.createObjectStore(SESSION_STORE, {
      keyPath: 'id',
    });
    db.createObjectStore(MESSAGE_STORE, {
      keyPath: 'id',
    });
  }
  // 版本2 新增表，存储语音
  if (!names.contains(AUDIO_STORE)) {
    db.createObjectStore(AUDIO_STORE, {
      autoIncrement: true,
    });
  }
};
request.onsuccess = async function (event) {
  // console.log('onsuccess', event);
  _resolve(request.result);
  console.log('数据库打开成功');
  // (window as any).myDb = request.result;
};

export default dbInstance;

export async function initDB() {
  const db = await dbInstance;
  if (localStorage[ASSISTANT_ID]) return;
  const transaction = db.transaction(
    [ASSISTANT_STORE, SESSION_STORE],
    'readwrite'
  );
  const objectStore = transaction.objectStore(ASSISTANT_STORE);
  assistants.forEach((assistant) => {
    objectStore.add(assistant);
  });
  localStorage[ASSISTANT_ID] = assistants[0].id;

  const objectStore2 = transaction.objectStore(SESSION_STORE);
  const sessionId = `${Date.now()}`;
  localStorage[EMPTY_SESSION_ID] = sessionId;

  objectStore2.add({
    id: sessionId,
    name: `${assistants[0].name}-会话`,
    model: 'gpt-3.5-turbo',
    assistantId: localStorage[ASSISTANT_ID],
  });
  return new Promise((resolve) => {
    transaction.oncomplete = () => {
      resolve(null);
    };
  });
}
