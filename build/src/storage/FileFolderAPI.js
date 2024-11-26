
    let exports = {};
    let module = { exports };
    "use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule && mod.default) ? mod : { "default": mod };
};

//exports.resetStorageLocation = exports.getFileStorage = exports.getDirectoryHandle = void 0;
import * as preact_1 from "../.././node_modules/preact/dist/preact.js";
import fileSystemPointer_1 from "./fileSystemPointer.js";
import mobxTyped_1 from "../misc/mobxTyped.js";
import observer_1 from "../misc/observer.js";
import caching_1 from "../.././node_modules/socket-function/src/caching.js";
import typesafecss_1 from "../.././node_modules/typesafecss/index.js";
import batching_1 from "../.././node_modules/socket-function/src/batching.js";
import IndexedDBFileFolderAPI_1 from "./IndexedDBFileFolderAPI.js";
const USE_INDEXED_DB = true;
let handleToId = new Map();
let displayData = (0, mobxTyped_1.observable)({
    ui: undefined,
}, undefined, { deep: false });
const storageKey = "syncFileSystemCamera3";
let DirectoryPrompter = class DirectoryPrompter extends preact_1.default.Component {
    render() {
        if (!displayData.ui)
            return undefined;
        return (preact_1.default.createElement("div", { className: typesafecss_1.css.position("fixed").pos(0, 0).size("100vw", "100vh")
                .zIndex(1)
                .background("white")
                .center
                .fontSize(40) }, displayData.ui));
    }
};
DirectoryPrompter = __decorate([
    observer_1.observer
], DirectoryPrompter);
// NOTE: Blocks until the user provides a directory
exports.getDirectoryHandle = (0, caching_1.lazy)(async function getDirectoryHandle() {
    let root = document.createElement("div");
    document.body.appendChild(root);
    preact_1.default.render(preact_1.default.createElement(DirectoryPrompter, null), root);
    try {
        let handle;
        let storedId = localStorage.getItem(storageKey);
        if (storedId) {
            let doneLoad = false;
            setTimeout(() => {
                if (doneLoad)
                    return;
                console.log("Waiting for user to click");
                displayData.ui = "Click anywhere to allow file system access";
            }, 500);
            try {
                handle = await tryToLoadPointer(storedId);
            }
            catch (_a) { }
            doneLoad = true;
            if (handle) {
                handleToId.set(handle, storedId);
                return handle;
            }
        }
        let fileCallback;
        let promise = new Promise(resolve => {
            fileCallback = resolve;
        });
        displayData.ui = (preact_1.default.createElement("button", { className: typesafecss_1.css.fontSize(40).pad2(80, 40), onClick: async () => {
                console.log("Waiting for user to give permission");
                const handle = await window.showDirectoryPicker();
                await handle.requestPermission({ mode: "readwrite" });
                let storedId = await (0, fileSystemPointer_1.storeFileSystemPointer)({ mode: "readwrite", handle });
                localStorage.setItem(storageKey, storedId);
                handleToId.set(handle, storedId);
                fileCallback(handle);
            } }, "Pick Media Directory"));
        return await promise;
    }
    finally {
        preact_1.default.render(null, root);
        root.remove();
    }
});
exports.getFileStorage = (0, caching_1.lazy)(async function getFileStorage() {
    if ((0, typesafecss_1.isNode)())
        return "No file storage in NodeJS. Is the build script running startup steps? Check for isNode() and NOOP those";
    if (USE_INDEXED_DB) {
        return await (0, IndexedDBFileFolderAPI_1.getFileStorageIndexDB)();
    }
    let handle = await (0, exports.getDirectoryHandle)();
    let id = handleToId.get(handle);
    if (!id)
        throw new Error("Missing id for handle");
    return wrapHandle(handle, id);
});
function resetStorageLocation() {
    localStorage.removeItem(storageKey);
    window.location.reload();
}
exports.resetStorageLocation = resetStorageLocation;
let appendQueue = (0, caching_1.cache)((key) => {
    return (0, batching_1.runInSerial)((fnc) => fnc());
});
async function fixedGetFileHandle(config) {
    // ALWAYS try without create, because the sshfs-win sucks and doesn't support `create: true`? Wtf...
    try {
        return await config.handle.getFileHandle(config.key);
    }
    catch (_a) {
        if (!config.create)
            return undefined;
    }
    return await config.handle.getFileHandle(config.key, { create: true });
}
function wrapHandleFiles(handle) {
    return {
        async getInfo(key) {
            try {
                const file = await handle.getFileHandle(key);
                const fileContent = await file.getFile();
                return {
                    size: fileContent.size,
                    lastModified: fileContent.lastModified,
                };
            }
            catch (error) {
                return undefined;
            }
        },
        async get(key) {
            try {
                const file = await handle.getFileHandle(key);
                const fileContent = await file.getFile();
                const arrayBuffer = await fileContent.arrayBuffer();
                return Buffer.from(arrayBuffer);
            }
            catch (error) {
                return undefined;
            }
        },
        async append(key, value) {
            await appendQueue(key)(async () => {
                // NOTE: Interesting point. Chrome doesn't optimize this to be an append, and instead
                //  rewrites the entire file.
                const file = await fixedGetFileHandle({ handle, key, create: true });
                const writable = await file.createWritable({ keepExistingData: true });
                let offset = (await file.getFile()).size;
                await writable.seek(offset);
                await writable.write(value);
                await writable.close();
            });
        },
        async set(key, value) {
            const file = await fixedGetFileHandle({ handle, key, create: true });
            const writable = await file.createWritable();
            await writable.write(value);
            await writable.close();
        },
        async remove(key) {
            await handle.removeEntry(key);
        },
        async getKeys() {
            const keys = [];
            for await (const [name, entry] of handle) {
                if (entry.kind === "file") {
                    keys.push(entry.name);
                }
            }
            return keys;
        },
        async reset() {
            for await (const [name, entry] of handle) {
                await handle.removeEntry(entry.name, { recursive: true });
            }
        },
    };
}
function wrapHandleNested(handle, id) {
    return {
        async hasKey(key) {
            try {
                await handle.getDirectoryHandle(key);
                return true;
            }
            catch (error) {
                return false;
            }
        },
        async getStorage(key) {
            const subDirectory = await handle.getDirectoryHandle(key, { create: true });
            return wrapHandle(subDirectory, id);
        },
        async removeStorage(key) {
            await handle.removeEntry(key, { recursive: true });
        },
        async getKeys() {
            const keys = [];
            for await (const [name, entry] of handle) {
                if (entry.kind === "directory") {
                    keys.push(entry.name);
                }
            }
            return keys;
        },
    };
}
function wrapHandle(handle, id = "default") {
    return {
        ...wrapHandleFiles(handle),
        folder: wrapHandleNested(handle, id),
        id,
    };
}
async function tryToLoadPointer(pointer) {
    let result = await (0, fileSystemPointer_1.getFileSystemPointer)({ pointer });
    if (!result)
        return;
    let handle = await (result === null || result === void 0 ? void 0 : result.onUserActivation());
    if (!handle)
        return;
    return handle;
}

 /* _JS_SOURCE_HASH = "b6a57c142d4884fc11e1cdcd8979f6cc47288eb139ee66d7950370d6ab8772fd"; */
    ;
    export default exports;
    