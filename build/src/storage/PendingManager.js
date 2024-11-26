
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

//exports.PendingDisplay = exports.setPending = void 0;
import misc_1 from "../.././node_modules/socket-function/src/misc.js";
import mobxTyped_1 from "../misc/mobxTyped.js";
import * as preact_1 from "../.././node_modules/preact/dist/preact.js";
import typesafecss_1 from "../.././node_modules/typesafecss/index.js";
import observer_1 from "../misc/observer.js";
import format_1 from "../.././node_modules/socket-function/src/formatting/format.js";
let watchState = (0, mobxTyped_1.observable)({
    pending: {}
});
let pendingLastSets = new Map();
let pendingCache = new Map();
// "" clears the pending value
function setPending(group, message) {
    pendingCache.set(group, message);
    void setPendingBase();
}
exports.setPending = setPending;
// NOTE: This not only prevents render overload, but also means any pending that are < this
//  delay don't show up (which is useful to reduce unnecessary pending messages).
const setPendingBase = (0, misc_1.throttleFunction)(500, function setPendingBase() {
    for (let [group, message] of pendingCache) {
        if (!message) {
            let lastSet = pendingLastSets.get(group);
            if (lastSet) {
                let duration = Date.now() - lastSet;
                if (duration > 500) {
                    console.log(`Finished slow task after ${(0, format_1.formatTime)(duration)}: ${JSON.stringify(group)}, last is ${JSON.stringify(watchState.pending[group])}`);
                }
                pendingLastSets.delete(group);
            }
            delete watchState.pending[group];
        }
        else {
            //console.log("setPending", group, message);
            if (!(group in watchState.pending)) {
                pendingLastSets.set(group, Date.now());
            }
            watchState.pending[group] = message;
        }
    }
    pendingCache.clear();
});
let PendingDisplay = class PendingDisplay extends preact_1.default.Component {
    render() {
        // Single line, giving equal space, and ellipsis for overflow
        return preact_1.default.createElement("div", { className: typesafecss_1.css.hbox(10) }, Object.keys(watchState.pending).map(group => (preact_1.default.createElement("div", { className: typesafecss_1.css.center.textOverflow("ellipsis").border("1px solid black").pad2(6, 2) },
            group,
            ": ",
            watchState.pending[group]))));
    }
};
exports.PendingDisplay = PendingDisplay;
exports.PendingDisplay = PendingDisplay = __decorate([
    observer_1.observer
], PendingDisplay);

 /* _JS_SOURCE_HASH = "e4c5ab8f159fee6a054554f6ef4a9ffc05e9105436db3669317c9e3476b4bd65"; */
    ;
    export default exports;
    