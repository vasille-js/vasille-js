import { setErrorHandler as coreSetErrorHandler } from "vasille";
import { errorToString, inspector } from "vasille/dev";

export {
    DevDelay,
    DevWatch,
    DevFor,
    DevSwitch,
    DevSlot,
    DevSetModelView,
    DevMapModelView,
    DevArrayModelView,
    DevArrayView,
} from "./components.js";
export {
    devStore,
    type DevComposed,
    devModel,
    devMount,
    devView,
    devDynamicalModule,
    type DevFragmentMap,
} from "./compose.js";
export { devArrayModel, devMapModel, devEnsure, devExpr, devMatch, devSetModel, devRef, devSet } from "./internal.js";
export { devAwaited } from "./library.js";

function devErrorHandler(e: unknown) {
    inspector.reportError({
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
