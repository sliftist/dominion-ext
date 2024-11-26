
    let exports = {};
    let module = { exports };
    "use strict";

//exports.PendingStorage = void 0;
import misc_1 from "../.././node_modules/socket-function/src/misc.js";
import PendingManager_1 from "./PendingManager.js";
class PendingStorage {
    constructor(pendingGroup, storage) {
        this.pendingGroup = pendingGroup;
        this.storage = storage;
        this.pending = new Map();
        this.updatePending = (0, misc_1.throttleFunction)(100, () => {
            let text = Array.from(this.pending.entries()).map(([key, value]) => `${key}: ${value}`).join(", ");
            (0, PendingManager_1.setPending)(this.pendingGroup, text);
        });
    }
    async get(key) {
        return this.watchPending("get", this.storage.get(key));
    }
    async set(key, value) {
        return this.watchPending("set", this.storage.set(key, value));
    }
    async remove(key) {
        return this.watchPending("remove", this.storage.remove(key));
    }
    async getKeys() {
        return this.watchPending("getKeys", this.storage.getKeys());
    }
    async getInfo(key) {
        return this.watchPending("getInfo", this.storage.getInfo(key));
    }
    watchPending(type, promise) {
        this.pending.set(type, (this.pending.get(type) || 0) + 1);
        void this.updatePending();
        void promise.finally(() => {
            this.pending.set(type, (this.pending.get(type) || 0) - 1);
            if (this.pending.get(type) === 0) {
                this.pending.delete(type);
            }
            void this.updatePending();
        });
        return promise;
    }
    async reset() {
        return this.storage.reset();
    }
    toString() {
        return this.pendingGroup;
    }
}
exports.PendingStorage = PendingStorage;

 /* _JS_SOURCE_HASH = "88933b23dda6439856e54e825af554467f1ff5adfe1c7fe19f56e4d9be4266b0"; */
    ;
    export default exports;
    