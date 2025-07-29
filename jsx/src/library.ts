import { IValue, Reactive } from "vasille";

export function awaited<T>(
    node: Reactive,
    target: Promise<T> | (() => Promise<T>),
    errName?: string,
    dataName?: string,
): [IValue<unknown>, IValue<unknown>, () => void] {
    const value = node.ref<unknown>(undefined, dataName);
    const err = node.ref<unknown>(undefined, errName);
    let running = false;

    function run() {
        if (running) {
            return;
        }

        let current: Promise<T> | (() => Promise<T>) | undefined = target;

        running = true;
        err.$ = undefined;
        value.$ = undefined;

        if (typeof current === "function") {
            try {
                current = current();
            } catch (e) {
                current = undefined;
                err.$ = e;
            }
        }

        if (current instanceof Promise) {
            current
                .then(result => {
                    value.$ = result;
                })
                .catch(e => {
                    err.$ = e;
                })
                .finally(() => {
                    running = false;
                });
        } else {
            value.$ = current;
            running = false;
        }
    }

    run();

    return [err, value, run];
}

export function ensureIValue<T>(node: Reactive, value: T | IValue<T>): IValue<T> {
    return value instanceof IValue ? value : node.ref(value);
}
