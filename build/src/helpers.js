
    let exports = {};
    let module = { exports };
    "use strict";

//exports.isInNewTabPage = exports.isInServiceWorker = exports.isInBuild = exports.isInBrowser = exports.isInChromeExtension = void 0;
function isInChromeExtension() {
    return typeof chrome !== "undefined";
}
exports.isInChromeExtension = isInChromeExtension;
function isInBrowser() {
    return typeof document !== "undefined";
}
exports.isInBrowser = isInBrowser;
function isInBuild() {
    return !isInBrowser() && !isInChromeExtension();
}
exports.isInBuild = isInBuild;
function isInServiceWorker() {
    return isInChromeExtension() && !isInBrowser();
}
exports.isInServiceWorker = isInServiceWorker;
function isInNewTabPage() {
    return isInChromeExtension() && isInBrowser();
}
exports.isInNewTabPage = isInNewTabPage;

 /* _JS_SOURCE_HASH = "a33ff3c23f04a0c3472d0e9d4f896a485fece724ee91e1bb7f0ffc059bcea3dc"; */
    ;
    export default exports;
    