import { setErrorHandler as coreSetErrorHandler } from "vasille";
import { errorToString } from "vasille/dev";
import { earlyInspector } from "./early-inspector.js";

export { DevDelay, DevWatch, DevFor, DevSwitch, DevSlot } from "./components.js";
export { devStore, type DevComposed, devModel, devMount, devView } from "./compose.js";
export { devArrayModel, devMapModel, devEnsure, devExpr, devMatch, devSetModel, devRef, devSet } from "./internal.js";
export { devAwaited } from "./library.js";
export { AbstractInspector, EarlyInspector, earlyInspector } from "./early-inspector.js";

function devErrorHandler(e: unknown) {
    earlyInspector.reportError({
        targetId: 0,
        error: errorToString(e),
        time: Date.now(),
    });
    console.error(e);
}

coreSetErrorHandler(devErrorHandler);

export function setErrorHandler(fn: (e: unknown) => void) {
    coreSetErrorHandler(e => {
        devErrorHandler(e);
        fn(e);
    });
}
