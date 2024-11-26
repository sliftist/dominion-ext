
    let exports = {};
    let module = { exports };
    "use strict";

//exports.observer = void 0;
import mobxTyped_1 from "./mobxTyped.js";
let globalConstructOrder = 1;
function observer(Constructor) {
    let name = Constructor.name;
    return class extends Constructor {
        constructor() {
            super(...arguments);
            this.reaction = new mobxTyped_1.Reaction(`render.${name}.${globalConstructOrder++}`, () => {
                super.forceUpdate();
            });
        }
        // @ts-ignore
        static get name() { return Constructor.name; }
        componentWillUnmount() {
            var _a;
            this.reaction.dispose();
            (_a = super.componentWillUnmount) === null || _a === void 0 ? void 0 : _a.call(this);
        }
        render(...args) {
            let output;
            this.reaction.track(() => {
                output = super.render(...args);
            });
            return output;
        }
    };
}
exports.observer = observer;

 /* _JS_SOURCE_HASH = "44d2b9e102cf5790f0fee6a03b1e667c1998c33f63fb59bdea35142425412a5a"; */
    ;
    export default exports;
    