
    let exports = {};
    let module = { exports };
    "use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule && mod.default) ? mod : { "default": mod };
};

//exports.action = exports.Reaction = exports.observable = void 0;
// @ts-ignore
import * as mobx_cjs_development_js_1 from "../.././node_modules/mobx/dist/mobx.cjs.development.js";
const mobxInstance = mobx_cjs_development_js_1.default;
let lastRenderTime = 0;
mobxInstance.configure({
    enforceActions: "never",
    reactionScheduler(callback) {
        void Promise.resolve().finally(() => {
            let now = performance.now();
            if (now - lastRenderTime < 16) {
                setTimeout(callback, 0);
            }
            else {
                callback();
            }
            lastRenderTime = now;
        });
    }
});
exports.observable = mobxInstance.observable, exports.Reaction = mobxInstance.Reaction, exports.action = mobxInstance.action;

 /* _JS_SOURCE_HASH = "36d06d96ad493b2634ebf5d49c536a05b4252a96fe04d060d09c7749ca898ed1"; */
    ;
    export default exports;
    