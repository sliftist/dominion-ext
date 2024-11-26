
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

//exports.injectUI = void 0;
import misc_1 from ".././node_modules/socket-function/src/misc.js";
import DiskCollection_1 from "./storage/DiskCollection.js";
import observer_1 from "./misc/observer.js";
import * as preact_1 from ".././node_modules/preact/dist/preact.js";
const DOM_POLL_INTERVAL = 500;
let games = new DiskCollection_1.DiskCollection("games");
let InboxReplacement = class InboxReplacement extends preact_1.default.Component {
    render() {
        return "replaced";
    }
};
InboxReplacement = __decorate([
    observer_1.observer
], InboxReplacement);
async function injectUI() {
    console.log("Injecting UI");
    debugger;
    setInterval(async () => {
        let gameNumber = getGameNumber();
        if (!gameNumber)
            return;
        if (await games.getPromise(gameNumber))
            return;
        games.set(gameNumber, { id: gameNumber, replayList: getReplayList() });
    }, DOM_POLL_INTERVAL);
    setInterval(() => {
        if (getCurrentTab() === "Inbox") {
            let page = document.querySelector(".window.inbox");
            if (!page)
                return;
            if (!page.querySelector("inbox"))
                return;
            preact_1.default.render(preact_1.default.createElement(InboxReplacement, null), page);
        }
    }, DOM_POLL_INTERVAL);
}
exports.injectUI = injectUI;
function getCurrentTab() {
    var _a, _b;
    return (_b = (_a = document.querySelector(".tab.selected")) === null || _a === void 0 ? void 0 : _a.textContent) === null || _b === void 0 ? void 0 : _b.trim();
}
function getReplayList() {
    function getStackName(stack) {
        var _a;
        return ((_a = stack.querySelector(".name-layer")) === null || _a === void 0 ? void 0 : _a.textContent) || "";
    }
    let stacks = Array.from(document.querySelectorAll(".card-stacks > div"));
    let allNames = new Set(stacks.map(x => getStackName(x)).filter(x => x));
    let sideHeight = Math.round(stacks[0].getBoundingClientRect().height);
    stacks = stacks.filter(x => {
        let height = Math.round(x.getBoundingClientRect().height);
        return sideHeight < height && height < sideHeight * 2;
    });
    let mainNames = new Set(stacks.map(x => getStackName(x)).filter(x => x));
    if (allNames.has("Overgrown Estate") || allNames.has("Hovel") || allNames.has("Necropolis")) {
        mainNames.add("Shelters");
    }
    else {
        mainNames.add("No Shelters");
    }
    if (allNames.has("Platinum") || allNames.has("Colony")) {
        mainNames.add("Colonies");
    }
    else {
        mainNames.add("No Colonies");
    }
    for (let stack of stacks) {
        let nextStack = stack === null || stack === void 0 ? void 0 : stack.nextElementSibling;
        if (!nextStack)
            continue;
        if (nextStack.getBoundingClientRect().height >= sideHeight * 0.5)
            continue;
        if (nextStack.getBoundingClientRect().height <= 0)
            continue;
        // Find really short stacks, which are associated cardsa
        let baseName = getStackName(stack);
        if (!mainNames.has(baseName))
            continue;
        let addOnName = getStackName(nextStack);
        mainNames.delete(addOnName);
        mainNames.add(`${addOnName} (${baseName})`);
    }
    return Array.from(mainNames);
}
function getGameNumber() {
    var _a;
    // first .log-line in .game-log
    let rawText = (_a = document.querySelector(".game-log .log-line")) === null || _a === void 0 ? void 0 : _a.textContent;
    if (!rawText)
        return undefined;
    return rawText.split(",")[0].replace("Game #", "").trim();
}
if (!(0, misc_1.isNode)()) {
    window.getReplayList = getReplayList;
}

 /* _JS_SOURCE_HASH = "051ee7433a56cde46024c91a254ebadb61a4ece5a6da3d9ff8546a9e62b735b6"; */
    ;
    export default exports;
    