import { IValue } from "vasille";
import { ref } from "./internal.js";

export function awaited<T>(target: Promise<T> | (() => Promise<T>)): [IValue<unknown>, IValue<unknown>, () => void] {
    const value = ref<unknown>(undefined);
    const err = ref<unknown>(undefined);
    let running = false;

    function run() {
        if (running) {
            return;
        }

        let current: Promise<T> | (() => Promise<T>) | undefined = target;

        running = true;
        err.V = undefined;
        value.V = undefined;

        if (typeof current === "function") {
            try {
                current = current();
            } catch (e) {
                current = undefined;
                err.V = e;
            }
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
