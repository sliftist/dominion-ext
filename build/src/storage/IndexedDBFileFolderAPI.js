
    let exports = {};
    let module = { exports };
    "use strict";

//exports.getFileStorageIndexDB = void 0;
import caching_1 from "../.././node_modules/socket-function/src/caching.js";
const DB_NAME = "FileStorage";
const STORE_NAME = "files";
const DB_VERSION = 1;
class VirtualFileStorage {
    constructor(db, id) {
        this.id = id;
        // NestedFileStorage implementation
        this.folder = {
            hasKey: async (key) => {
                const folderPath = this.id + key + "/";
                const keys = await this.getKeysWithPrefix(folderPath);
                return keys.length > 0;
            },
            getStorage: async (key) => {
                const newPath = this.id + key + "/";
                return new VirtualFileStorage(this.db, newPath);
            },
            removeStorage: async (key) => {
                let nested = new VirtualFileStorage(this.db, this.id + key + "/");
                await nested.reset();
            },
            getKeys: async () => {
                let keys = await this.getKeysWithPrefix(this.id);
                let folderKeys = new Set();
                for (let key of keys) {
                    if (!key.includes("/"))
                        continue;
                    let parts = key.split("/");
                    folderKeys.add(parts[0]);
                }
                return Array.from(folderKeys);
            }
        };
        if (!db)
            debugger;
        this.db = db;
    }
    getStore(mode = "readonly") {
        const transaction = this.db.transaction(STORE_NAME, mode);
        return transaction.objectStore(STORE_NAME);
    }
    request(request) {
        return new Promise((resolve, reject) => {
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    // IStorageRaw implementation
    async get(key) {
        const store = this.getStore();
        const result = await this.request(store.get(this.id + key));
        let badBuffer = result === null || result === void 0 ? void 0 : result.data;
        if (badBuffer)
            badBuffer = Buffer.from(badBuffer);
        return badBuffer;
    }
    async append(key, value) {
        const store = this.getStore("readwrite");
        const fullPath = this.id + key;
        const existing = await this.request(store.get(fullPath));
        const newRecord = {
            data: existing
                ? Buffer.concat([existing.data, value])
                : value,
            lastModified: Date.now()
        };
        await this.request(store.put(newRecord, fullPath));
    }
    async set(key, value) {
        const store = this.getStore("readwrite");
        const record = {
            data: value,
            lastModified: Date.now()
        };
        await this.request(store.put(record, this.id + key));
    }
    async remove(key) {
        const store = this.getStore("readwrite");
        await this.request(store.delete(this.id + key));
    }
    async getKeysWithPrefix(prefix) {
        const store = this.getStore();
        const range = IDBKeyRange.bound(prefix, prefix + "\uffff", false, true);
        return new Promise((resolve, reject) => {
            const keys = [];
            const request = store.openCursor(range);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                const cursor = request.result;
                if (cursor) {
                    let newKey = cursor.key;
                    newKey = newKey.slice(this.id.length);
                    keys.push(newKey);
                    cursor.continue();
                }
                else {
                    resolve(keys);
                }
            };
        });
    }
    async getKeys() {
        let keys = await this.getKeysWithPrefix(this.id);
        return keys.filter(x => !x.includes("/"));
    }
    async getInfo(key) {
        const store = this.getStore();
        const result = await this.request(store.get(this.id + key));
        if (!result)
            return undefined;
        return {
            size: result.data.length,
            lastModified: result.lastModified
        };
    }
    async reset() {
        let keys = await this.getKeysWithPrefix(this.id);
        for (let key of keys) {
            await this.remove(key);
        }
    }
}
exports.getFileStorageIndexDB = (0, caching_1.lazy)(async () => {
    const db = await new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };
    });
    return new VirtualFileStorage(db, "/");
});

 /* _JS_SOURCE_HASH = "61f2f838c36580d99722850f8b6b02162c2d526b1c151e6a3863889c5de11c7a"; */
    ;
    export default exports;
    