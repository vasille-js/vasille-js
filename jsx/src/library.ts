import { IValue } from "vasille";
import { ref } from "./internal.js";

export function awaited<T>(target: () => Promise<T>, createRef = ref): [IValue<unknown>, IValue<unknown>, () => void] {
    const err = createRef<unknown>(undefined);
    const value = createRef<unknown>(undefined);
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
            current = target();
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

    run();

    return [err, value, run];
}
