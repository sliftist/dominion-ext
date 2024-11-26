
    let exports = {};
    let module = { exports };
    "use strict";

//exports.StorageSync = void 0;
import mobxTyped_1 from "../misc/mobxTyped.js";
// Assumes it is the only writer
class StorageSync {
    constructor(storage) {
        this.storage = storage;
        this.cached = mobxTyped_1.observable.map();
        this.infoCached = mobxTyped_1.observable.map();
        this.keys = new Set();
        this.synced = (0, mobxTyped_1.observable)({
            keySeqNum: 0,
        }, undefined, { deep: false });
        this.loadedKeys = false;
    }
    get(key) {
        if (!this.cached.has(key)) {
            this.cached.set(key, undefined);
            void this.getPromise(key);
        }
        if (this.cached.get(key) === undefined) {
            this.synced.keySeqNum;
        }
        return this.cached.get(key);
    }
    set(key, value) {
        if (!this.keys.has(key)) {
            this.keys.add(key);
            this.synced.keySeqNum++;
        }
        this.cached.set(key, value);
        void this.storage.set(key, value);
    }
    remove(key) {
        if (this.keys.has(key)) {
            this.keys.delete(key);
            this.synced.keySeqNum++;
        }
        this.cached.delete(key);
        void this.storage.remove(key);
    }
    getKeys() {
        void this.getKeysPromise();
        this.synced.keySeqNum;
        return Array.from(this.keys);
    }
    getInfo(key) {
        if (!this.infoCached.has(key)) {
            this.infoCached.set(key, { size: 0, lastModified: 0 });
            void this.storage.getInfo(key).then(info => {
                this.infoCached.set(key, info);
            });
        }
        return this.infoCached.get(key);
    }
    async getPromise(key) {
        let value = this.cached.get(key);
        if (value === undefined) {
            value = await this.storage.get(key);
            if (this.cached.get(key) === undefined) {
                this.cached.set(key, value);
            }
        }
        return value;
    }
    async getKeysPromise() {
        if (this.pendingGetKeys) {
            return this.pendingGetKeys;
        }
        if (this.loadedKeys)
            return Array.from(this.keys);
        this.loadedKeys = true;
        this.pendingGetKeys = this.storage.getKeys();
        void this.pendingGetKeys.finally(() => {
            this.pendingGetKeys = undefined;
        });
        let keys = await this.pendingGetKeys;
        if (keys.length > 0) {
            this.keys = new Set(keys);
            this.synced.keySeqNum++;
        }
        return Array.from(this.keys);
    }
    resetKeys() {
        this.loadedKeys = false;
        this.synced.keySeqNum++;
    }
    resetKey(key) {
        this.cached.delete(key);
        this.infoCached.delete(key);
        this.keys.delete(key);
    }
    async reset() {
        this.cached.clear();
        this.infoCached.clear();
        this.keys.clear();
        this.synced.keySeqNum++;
        await this.storage.reset();
    }
}
exports.StorageSync = StorageSync;

 /* _JS_SOURCE_HASH = "3d17c81c27d8419c22142a1d3fe0e33d132253edb6a3867beeabf266d1f26bb0"; */
    ;
    export default exports;
    