// Öffnet die lokale Datenbank (IndexedDB) und bietet kleine Hilfen mit Promises.
// Speicher:
//   daten              – alle Einträge aller Tabellen: { table, id, row }
//   warteschlange      – welche Einträge noch hochgeladen werden müssen: { table, id }
//   meta               – Kleinigkeiten, z. B. Zeitpunkt des letzten Abgleichs: { key, value }
//   dateien            – Dateien (z. B. Bilder) als Blob: { pfad, blob }          (seit Version 2)
//   datei_warteschlange – Dateien, die hoch- oder weggeräumt werden müssen: { pfad, aktion } (seit Version 2)
// Neue Tabellen brauchen keine Änderung hier: alles liegt im Speicher „daten“.

const DB_NAME = 'system0';
const DB_VERSION = 2;

let dbPromise = null;

export function openDb() {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      // Nur anlegen, was es in der alten Version noch nicht gab (vorhandene Daten bleiben erhalten).
      req.onupgradeneeded = (e) => {
        const db = req.result;
        if (e.oldVersion < 1) {
          const daten = db.createObjectStore('daten', { keyPath: ['table', 'id'] });
          daten.createIndex('table', 'table');
          db.createObjectStore('warteschlange', { keyPath: ['table', 'id'] });
          db.createObjectStore('meta', { keyPath: 'key' });
        }
        if (e.oldVersion < 2) {
          db.createObjectStore('dateien', { keyPath: 'pfad' });
          db.createObjectStore('datei_warteschlange', { keyPath: 'pfad' });
        }
      };
      req.onsuccess = () => {
        const db = req.result;
        // Neuere App-Fassung in einem anderen Fenster will die Datenbank erweitern → hier loslassen
        db.onversionchange = () => {
          db.close();
          dbPromise = null;
        };
        resolve(db);
      };
      req.onerror = () => reject(req.error);
    });
  }
  return dbPromise;
}

// Wandelt eine IndexedDB-Anfrage in ein Promise um.
export function done(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Führt fn(stores) in einer Transaktion aus und wartet, bis alles gespeichert ist.
// stores = { daten, warteschlange, meta } (nur die angefragten)
export async function transaction(names, mode, fn) {
  const db = await openDb();
  const tx = db.transaction(names, mode);
  const stores = Object.fromEntries(names.map((n) => [n, tx.objectStore(n)]));
  const result = await fn(stores);
  await new Promise((resolve, reject) => {
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
  return result;
}
