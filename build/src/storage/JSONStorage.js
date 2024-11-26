
    let exports = {};
    let module = { exports };
    "use strict";

//exports.JSONStorage = void 0;
class JSONStorage {
    constructor(storage) {
        this.storage = storage;
    }
    async get(key) {
        let buffer = await this.storage.get(key);
        if (buffer === undefined) {
            return undefined;
        }
        try {
            return JSON.parse(buffer.toString());
        }
        catch (e) {
            console.warn(`Failed to parse JSON for key: ${key}`, buffer.toString(), e);
        }
    }
    async set(key, value) {
        await this.storage.set(key, Buffer.from(JSON.stringify(value)));
    }
    async remove(key) {
        await this.storage.remove(key);
    }
    async getKeys() {
        return await this.storage.getKeys();
    }
    async getInfo(key) {
        return await this.storage.getInfo(key);
    }
    async reset() {
        await this.storage.reset();
    }
}
exports.JSONStorage = JSONStorage;

 /* _JS_SOURCE_HASH = "1706a937ed1a0c0afcbb7b8efdd30107f09ced730ebdae1291b36c62078d1250"; */
    ;
    export default exports;
    