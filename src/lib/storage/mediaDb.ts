// Armazena os vídeos e a música enviados no IndexedDB do navegador,
// que comporta arquivos grandes (o localStorage não comporta).

const DB_NAME = 'clash-studio';
const STORE = 'media';

interface Row {
  id: string;
  blob: Blob;
  name: string;
  type: string;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE, { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function run<T>(mode: IDBTransactionMode, work: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDb();
  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const request = work(tx.objectStore(STORE));
    tx.oncomplete = () => {
      db.close();
      resolve(request.result);
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
    tx.onabort = () => {
      db.close();
      reject(tx.error);
    };
  });
}

export function saveMedia(id: string, file: File): Promise<IDBValidKey> {
  const row: Row = { id, blob: file, name: file.name, type: file.type };
  return run('readwrite', (store) => store.put(row));
}

export function deleteMedia(id: string): Promise<undefined> {
  return run('readwrite', (store) => store.delete(id));
}

export function clearMedia(): Promise<undefined> {
  return run('readwrite', (store) => store.clear());
}

export async function loadAllMedia(): Promise<{ id: string; file: File }[]> {
  const rows = await run<Row[]>('readonly', (store) => store.getAll());
  return rows.map((row) => ({ id: row.id, file: new File([row.blob], row.name, { type: row.type }) }));
}
