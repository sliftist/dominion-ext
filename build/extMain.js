"use strict";

import helpers_1 from "./src/helpers.js";
import consts_1 from "./consts.js";
import injectUI_1 from "./src/injectUI.js";
if ((0, helpers_1.isInBrowser)()) {
    window.process = {
        env: {}
    };
}
if ((0, helpers_1.isInBrowser)()) {
    // NOTE: This run in production, which causes to try to connect to a random websocket. HOWEVER,
    //  1, we don't do anything with it (if it fails, etc, it won't break anything, and 2, it is no
    //  less harmless than any of the dozens of blocked tracking requests. Failed requests are FAST.
    const socket = new WebSocket(`ws://localhost:${consts_1.HOT_RELOAD_PORT}`);
    socket.onmessage = function (event) {
        if (event.data === "Build completed successfully") {
            location.reload();
        }
    };
    async function main() {
        await (0, injectUI_1.injectUI)();
    }
    main().catch(console.error);
}

 /* _JS_SOURCE_HASH = "8539f40a3a2f73628269cec067139c75e457094271d97bf71c0327525ce4d46b"; */