
    let exports = {};
    let module = { exports };
    "use strict";

//exports.FileStorageSynced = exports.FileStorageBufferSyncer = exports.DiskCollectionRaw = exports.DiskCollectionPromise = exports.DiskCollection = void 0;
import typesafecss_1 from "../.././node_modules/typesafecss/index.js";
import DelayedStorage_1 from "./DelayedStorage.js";
import FileFolderAPI_1 from "./FileFolderAPI.js";
import JSONStorage_1 from "./JSONStorage.js";
import StorageObservable_1 from "./StorageObservable.js";
import TransactionStorage_1 from "./TransactionStorage.js";
import PendingStorage_1 from "./PendingStorage.js";
class DiskCollection {
    constructor(collectionName, writeDelay) {
        this.collectionName = collectionName;
        this.writeDelay = writeDelay;
        this.baseStorage = this.initStorage();
        this.synced = new StorageObservable_1.StorageSync(new PendingStorage_1.PendingStorage(`Collection (${this.collectionName})`, new DelayedStorage_1.DelayedStorage(this.baseStorage)));
    }
    async initStorage() {
        if ((0, typesafecss_1.isNode)())
            return undefined;
        let fileStorage = await (0, FileFolderAPI_1.getFileStorage)();
        let collections = await fileStorage.folder.getStorage("collections");
        let curCollection = await collections.folder.getStorage(this.collectionName);
        let baseStorage = new TransactionStorage_1.TransactionStorage(curCollection, this.collectionName, this.writeDelay);
        return new JSONStorage_1.JSONStorage(baseStorage);
    }
    get(key) {
        return this.synced.get(key);
    }
    async getPromise(key) {
        let base = await this.baseStorage;
        return base.get(key);
    }
    set(key, value) {
        this.synced.set(key, value);
    }
    remove(key) {
        this.synced.remove(key);
    }
    getKeys() {
        return this.synced.getKeys();
    }
    getEntries() {
        return this.getKeys().map(key => [key, this.get(key)]).filter(x => x[1] !== undefined);
    }
    getValues() {
        return this.getKeys().map(key => this.get(key)).filter(isDefined);
    }
    getInfo(key) {
        return this.synced.getInfo(key);
    }
    async reset() {
        await this.synced.reset();
    }
}
exports.DiskCollection = DiskCollection;
function isDefined(value) {
    return value !== undefined;
}
class DiskCollectionPromise {
    constructor(collectionName, writeDelay) {
        this.collectionName = collectionName;
        this.writeDelay = writeDelay;
        this.synced = (new PendingStorage_1.PendingStorage(`Collection (${this.collectionName})`, new DelayedStorage_1.DelayedStorage(this.initStorage())));
    }
    async initStorage() {
        if ((0, typesafecss_1.isNode)())
            return undefined;
        let fileStorage = await (0, FileFolderAPI_1.getFileStorage)();
        let collections = await fileStorage.folder.getStorage("collections");
        let curCollection = await collections.folder.getStorage(this.collectionName);
        let baseStorage = new TransactionStorage_1.TransactionStorage(curCollection, this.collectionName, this.writeDelay);
        return new JSONStorage_1.JSONStorage(baseStorage);
    }
    async get(key) {
        return await this.synced.get(key);
    }
    async set(key, value) {
        await this.synced.set(key, value);
    }
    async remove(key) {
        await this.synced.remove(key);
    }
    async getKeys() {
        return await this.synced.getKeys();
    }
    async getInfo(key) {
        return await this.synced.getInfo(key);
    }
    async reset() {
        await this.synced.reset();
    }
}
exports.DiskCollectionPromise = DiskCollectionPromise;
class DiskCollectionRaw {
    constructor(collectionName) {
        this.collectionName = collectionName;
        this.synced = (new PendingStorage_1.PendingStorage(`Collection (${this.collectionName})`, new DelayedStorage_1.DelayedStorage(this.initStorage())));
    }
    async initStorage() {
        if ((0, typesafecss_1.isNode)())
            return undefined;
        let fileStorage = await (0, FileFolderAPI_1.getFileStorage)();
        let collections = await fileStorage.folder.getStorage("collections");
        let baseStorage = await collections.folder.getStorage(this.collectionName);
        return baseStorage;
    }
    async get(key) {
        return await this.synced.get(key);
    }
    async set(key, value) {
        await this.synced.set(key, value);
    }
    async remove(key) {
        await this.synced.remove(key);
    }
    async getKeys() {
        return await this.synced.getKeys();
    }
    async getInfo(key) {
        return await this.synced.getInfo(key);
    }
    async reset() {
        await this.synced.reset();
    }
}
exports.DiskCollectionRaw = DiskCollectionRaw;
// TODO: Create a path version of this, which supports get and set on directories as well
class FileStorageBufferSyncer {
    constructor() {
        this.base = new PendingStorage_1.PendingStorage(`FileStorage Pending`, new DelayedStorage_1.DelayedStorage((0, FileFolderAPI_1.getFileStorage)()));
        this.synced = new StorageObservable_1.StorageSync(this.base);
    }
    get(key) {
        return this.synced.get(key);
    }
    set(key, value) {
        this.synced.set(key, value);
    }
    remove(key) {
        this.synced.remove(key);
    }
    getKeys() {
        return this.synced.getKeys();
    }
    getInfo(key) {
        return this.synced.getInfo(key);
    }
    getAsync() {
        return this.synced;
    }
    async reset() {
        await this.synced.reset();
    }
}
exports.FileStorageBufferSyncer = FileStorageBufferSyncer;
exports.FileStorageSynced = new FileStorageBufferSyncer();

 /* _JS_SOURCE_HASH = "f3d996b3abea7d84b31c2c0b44fbf4e3f7d8d6e4b3f01b2cbdb6f2b7064efe3e"; */
    ;
    export default exports;
    