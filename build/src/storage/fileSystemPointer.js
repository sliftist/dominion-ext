
    let exports = {};
    let module = { exports };
    "use strict";

//exports.getFileSystemPointer = exports.deleteFileSystemPointer = exports.storeFileSystemPointer = void 0;
import caching_1 from "../.././node_modules/socket-function/src/caching.js";
import misc_1 from "../.././node_modules/socket-function/src/misc.js";
const objectStoreName = "fileSystemPointerDB";
const db = (0, caching_1.lazy)(async () => {
    let db = indexedDB.open("fileSystemPointerDB_f298e962-bd8a-46b9-8098-25db633f4ed3", 1);
    db.addEventListener("upgradeneeded", () => {
        db.result.createObjectStore(objectStoreName, {});
    });
    await new Promise(resolve => db.addEventListener("success", resolve));
    return db.result;
});
async function getTransaction() {
    let database = await db();
    if (!database)
        return undefined;
    return database.transaction(objectStoreName, "readwrite").objectStore(objectStoreName);
}
async function write(key, value) {
    let transaction = await getTransaction();
    if (!transaction)
        return;
    let req = transaction.put(value, key);
    await new Promise((resolve, reject) => {
        req.addEventListener("success", resolve);
        req.addEventListener("error", reject);
    });
}
async function read(key) {
    let transaction = await getTransaction();
    if (!transaction)
        return;
    let req = transaction.get(key);
    await new Promise((resolve, reject) => {
        req.addEventListener("success", resolve);
        req.addEventListener("error", reject);
    });
    return req.result;
}
async function storeFileSystemPointer(config) {
    await config.handle.requestPermission({ mode: config.mode });
    let key = (0, misc_1.nextId)() + "_" + config.mode;
    await write(key, config.handle);
    return key;
}
exports.storeFileSystemPointer = storeFileSystemPointer;
async function deleteFileSystemPointer(pointer) {
    let transaction = await getTransaction();
    if (!transaction)
        return;
    let req = transaction.delete(pointer);
    await new Promise((resolve, reject) => {
        req.addEventListener("success", resolve);
        req.addEventListener("error", reject);
    });
}
exports.deleteFileSystemPointer = deleteFileSystemPointer;
async function getFileSystemPointer(config) {
    const handle = await read(config.pointer);
    if (!handle)
        return;
    let mode = config.pointer.split("_").at(-1);
    return {
        async onUserActivation(modeOverride) {
            let testMode = await handle.queryPermission({ mode: mode });
            if (testMode !== mode) {
                await handle.requestPermission({ mode: modeOverride !== null && modeOverride !== void 0 ? modeOverride : mode });
            }
            return handle;
        }
    };
}
exports.getFileSystemPointer = getFileSystemPointer;

 /* _JS_SOURCE_HASH = "4a06c9d06f02827736c6d1207f37bb801530ae60f3d4bb9fb3da7b8224f21266"; */
    ;
    export default exports;
    