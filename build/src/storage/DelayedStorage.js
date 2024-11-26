
    let exports = {};
    let module = { exports };
    "use strict";

//exports.DelayedStorage = void 0;
class DelayedStorage {
    constructor(storage) {
        this.storage = storage;
    }
    async get(key) {
        const storage = await this.storage;
        return storage.get(key);
    }
    async set(key, value) {
        const storage = await this.storage;
        return storage.set(key, value);
    }
    async remove(key) {
        const storage = await this.storage;
        return storage.remove(key);
    }
    async getKeys() {
        const storage = await this.storage;
        return storage.getKeys();
    }
    async getInfo(key) {
        const storage = await this.storage;
        return storage.getInfo(key);
    }
    async reset() {
        const storage = await this.storage;
        return storage.reset();
    }
}
exports.DelayedStorage = DelayedStorage;

 /* _JS_SOURCE_HASH = "c7a7369358763f059997cf93e823ff7d80700d850eff6756f25770e0d2c67cb5"; */
    ;
    export default exports;
    