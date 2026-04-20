import { IValue, Reactive } from "vasille";
import { ref } from "./internal.js";

export function awaited<T>(
    target: (signal: AbortSignal) => Promise<T>,
    ctx: Reactive,
    createRef = ref,
): [IValue<unknown>, IValue<unknown>, () => void, (reason?: unknown) => void] {
    const err = createRef<unknown>(undefined);
    const value = createRef<unknown>(undefined);
    const controller = new AbortController();
    let running = false;

    function run() {
        if (running) {
            return;
        }

        let current: Promise<T> | undefined;

        running = true;
        err.V = undefined;
        value.V = undefined;

        try {
            current = target(controller.signal);
        } catch (e) {
            current = undefined;
            err.V = e;
        }

        if (current instanceof Promise) {
            current
                .then(result => (value.V = result))
                .catch(e => (err.V = e))
                .finally(() => (running = false));
        } else {
            value.V = current;
            running = false;
        }
    }
    function abort(reason?: unknown) {
        controller.abort(reason);
    }

    ctx.runOnDestroy(() => {
        abort("context destroyed");
    });

    run();

    return [err, value, run, abort];
}
