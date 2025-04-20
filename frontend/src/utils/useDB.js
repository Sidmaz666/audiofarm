// idbUtility.js
import { DB_NAME, DB_VERSION, STORES } from "@utils/constants";

let dbPromise = null;

/**
 * Open (or create/upgrade) the database and object stores.
 * @returns {Promise<IDBDatabase>}
 */
function openDB() {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = (evt) => {
      const db = evt.target.result;
      if (!db.objectStoreNames.contains(STORES.HISTORY)) {
        db.createObjectStore(STORES.HISTORY, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORES.FAVORITES)) {
        db.createObjectStore(STORES.FAVORITES, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORES.PLAYLISTS)) {
        // playlists: keyPath = name, value = { name: string, items: Video[] }
        db.createObjectStore(STORES.PLAYLISTS, { keyPath: "name" });
      }
      if (!db.objectStoreNames.contains(STORES.DOWNLOADS)) {
        // downloads: keyPath = id, value = { id: string, binary: Blob|ArrayBuffer }
        db.createObjectStore(STORES.DOWNLOADS, { keyPath: "id" });
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });

  return dbPromise;
}

/** @typedef {{ id: string, title: string, duration: number, description: string, thumbnail: string, uploadDate: string, downloaded?: boolean }} Video */

/**
 * Helper: wrap IDBRequest in a promise.
 * @template T
 * @param {IDBRequest<T>} request
 * @returns {Promise<T>}
 */
function promisify(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Helper: get a transaction and its object store.
 * @param {string} storeName
 * @param {'readonly'|'readwrite'} mode
 * @returns {Promise<{ store: IDBObjectStore, tx: IDBTransaction }>}
 */
async function getStore(storeName, mode = "readonly") {
  const db = await openDB();
  const tx = db.transaction(storeName, mode);
  return { store: tx.objectStore(storeName), tx };
}

/** ------------------------------ GENERIC CRUD ------------------------------ */

/**
 * Add or overwrite a record in given store.
 * @param {string} storeName
 * @param {any} record
 * @returns {Promise<void>}
 */
async function addOrUpdate(storeName, record) {
  const { store } = await getStore(storeName, "readwrite");
  return promisify(store.put(record));
}

/**
 * Get one record by key.
 * @param {string} storeName
 * @param {string} key
 * @returns {Promise<any>}
 */
async function getRecord(storeName, key) {
  const { store } = await getStore(storeName);
  return promisify(store.get(key));
}

/**
 * Get all records from a store.
 * @param {string} storeName
 * @returns {Promise<any[]>}
 */
async function getAllRecords(storeName) {
  const { store } = await getStore(storeName);
  return promisify(store.getAll());
}

/**
 * Remove one record by key.
 * @param {string} storeName
 * @param {string} key
 * @returns {Promise<void>}
 */
async function removeRecord(storeName, key) {
  const { store } = await getStore(storeName, "readwrite");
  return promisify(store.delete(key));
}

/**
 * Clear all records from a store.
 * @param {string} storeName
 * @returns {Promise<void>}
 */
async function clearStore(storeName) {
  const { store } = await getStore(storeName, "readwrite");
  return promisify(store.clear());
}

/**
 * Check if a video is in the download store.
 * @param {string} id
 * @returns {Promise<boolean>}
 */
async function isDownloaded(id) {
  const rec = await getRecord(STORES.DOWNLOADS, id);
  return !!rec;
}

/** ------------------------------ HISTORY API ------------------------------ */

/**
 * @param {Video} video
 */
async function addHistory(video) {
  return addOrUpdate(STORES.HISTORY, video);
}
async function getHistory(id) {
  const rec = await getRecord(STORES.HISTORY, id);
  if (!rec) return null;
  rec.downloaded = await isDownloaded(id);
  return rec;
}
async function getAllHistory() {
  const all = await getAllRecords(STORES.HISTORY);
  return Promise.all(
    all.map(async (rec) => {
      rec.downloaded = await isDownloaded(rec.id);
      return rec;
    })
  );
}
async function removeHistory(id) {
  return removeRecord(STORES.HISTORY, id);
}
async function clearHistory() {
  return clearStore(STORES.HISTORY);
}

/** ------------------------------ FAVORITES API ------------------------------ */

async function addFavorite(video) {
  return addOrUpdate(STORES.FAVORITES, video);
}
async function getFavorite(id) {
  const rec = await getRecord(STORES.FAVORITES, id);
  if (!rec) return null;
  rec.downloaded = await isDownloaded(id);
  return rec;
}
async function getAllFavorites() {
  const all = await getAllRecords(STORES.FAVORITES);
  return Promise.all(
    all.map(async (rec) => {
      rec.downloaded = await isDownloaded(rec.id);
      return rec;
    })
  );
}
async function removeFavorite(id) {
  return removeRecord(STORES.FAVORITES, id);
}
async function clearFavorites() {
  return clearStore(STORES.FAVORITES);
}

/** ------------------------------ PLAYLISTS API ------------------------------ */

/**
 * Create a new, empty playlist.
 * @param {string} name
 */
async function createPlaylist(name) {
  const existing = await getRecord(STORES.PLAYLISTS, name);
  if (existing) throw new Error(`Playlist "${name}" already exists`);
  return addOrUpdate(STORES.PLAYLISTS, {
    name,
    items: [],
    createdAt: new Date().toISOString(),
  });
}

/**
 * Delete a playlist entirely.
 * @param {string} name
 */
async function deletePlaylist(name) {
  return removeRecord(STORES.PLAYLISTS, name);
}

/**
 * Rename a playlist.
 * @param {string} oldName
 * @param {string} newName
 */
async function renamePlaylist(oldName, newName) {
  const pl = await getRecord(STORES.PLAYLISTS, oldName);
  if (!pl) throw new Error(`Playlist "${oldName}" not found`);
  await addOrUpdate(STORES.PLAYLISTS, {
    name: newName,
    items: pl.items,
    createdAt: pl.createdAt,
  });
  return removeRecord(STORES.PLAYLISTS, oldName);
}

/**
 * Add or overwrite a video in a named playlist.
 * @param {string} name
 * @param {Video} video
 */
async function addToPlaylist(name, video) {
  const pl = await getRecord(STORES.PLAYLISTS, name);
  if (!pl) throw new Error(`Playlist "${name}" not found`);
  // remove duplicates by id, then push
  pl.items = pl.items.filter((v) => v.id !== video.id);
  pl.items.push(video);
  return addOrUpdate(STORES.PLAYLISTS, pl);
}

/**
 * Remove one video by id from a named playlist.
 * @param {string} name
 * @param {string} videoId
 */
async function removeFromPlaylist(name, videoId) {
  const pl = await getRecord(STORES.PLAYLISTS, name);
  if (!pl) throw new Error(`Playlist "${name}" not found`);
  pl.items = pl.items.filter((v) => v.id !== videoId);
  return addOrUpdate(STORES.PLAYLISTS, pl);
}

/**
 * Get one playlist (with downloaded flags on each video).
 * @param {string} name
 * @returns {Promise<{name:string,items:Video[]}>}
 */
async function getPlaylist(name) {
  const pl = await getRecord(STORES.PLAYLISTS, name);
  if (!pl) return null;
  pl.items = await Promise.all(
    pl.items.map(async (v) => {
      v.downloaded = await isDownloaded(v.id);
      return v;
    })
  );
  return pl;
}

/**
 * Get all playlists.
 * @returns {Promise<Array<{name:string,items:Video[]}>>}
 */
async function getAllPlaylists() {
  const all = await getAllRecords(STORES.PLAYLISTS);
  return Promise.all(
    all.map(async (pl) => {
      pl.items = await Promise.all(
        pl.items.map(async (v) => {
          v.downloaded = await isDownloaded(v.id);
          return v;
        })
      );
      return pl;
    })
  );
}

/** ------------------------------ DOWNLOADS API ------------------------------ */

/**
 * Save or overwrite a download binary.
 * @param {string} id
 * @param {Blob|ArrayBuffer} binary
 */
async function saveDownload(id, binary) {
  return addOrUpdate(STORES.DOWNLOADS, { id, binary });
}

/**
 * Get one download record back.
 * @param {string} id
 * @returns {Promise<{id:string, binary:Blob|ArrayBuffer}>}
 */
async function getDownload(id) {
  return getRecord(STORES.DOWNLOADS, id);
}

/**
 * Remove one download.
 * @param {string} id
 */
async function removeDownload(id) {
  return removeRecord(STORES.DOWNLOADS, id);
}

/**
 * Get all downloads.
 * @returns {Promise<Array<{id:string, binary:Blob|ArrayBuffer}>>}
 */
async function getAllDownloads() {
  return getAllRecords(STORES.DOWNLOADS);
}

// Export everything
export {
  // history
  addHistory,
  getHistory,
  getAllHistory,
  removeHistory,
  clearHistory,
  // favorites
  addFavorite,
  getFavorite,
  getAllFavorites,
  removeFavorite,
  clearFavorites,
  // playlists
  createPlaylist,
  deletePlaylist,
  renamePlaylist,
  addToPlaylist,
  removeFromPlaylist,
  getPlaylist,
  getAllPlaylists,
  // downloads
  saveDownload,
  getDownload,
  removeDownload,
  getAllDownloads,
  clearStore,
  STORES,
};
