const ROOTS = 'roots';
const OBJECTS = 'objects';

function openDatabase(name: string) {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(name, 1);
    request.onerror = (event) => {
      reject(request.error);
    };
    request.onupgradeneeded = (event) => {
      const db = request.result;
      db.createObjectStore('roots', {
        keyPath: 'id',
      });
    };
    request.onsuccess = (event) => {
      resolve(request.result);
    };
  });
}
const databaseOpenPromise = openDatabase('persistence');

const storageRoots: Record<string, any> = {};
const persistedObjects: Record<string, any> = {};
const hydrationCallbacks: Record<string, (initialState: any) => void> = {};

async function hydrate(db: IDBDatabase) {
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(['roots']);
    const objectStore = transaction.objectStore('roots');
    const request = objectStore.getAll();
    request.onsuccess = (event) => {
      for (const obj of request.result) {
        storageRoots[obj.id] = obj;
        hydrationCallbacks[obj.id]?.(obj);
      }
      resolve();
    };
  });
}
