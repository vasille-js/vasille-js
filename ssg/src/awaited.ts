import { ref } from "vasille-jsx";
import { IValue } from "vasille";

let count = 0;

export function awaited<T>(target: () => Promise<T>): [IValue<unknown>, IValue<unknown>, () => void] {
    const value = ref<unknown>(undefined);
    const err = ref<unknown>(undefined);
    let current: Promise<T> | undefined;

    count++;

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
            .finally(() => count--);
    } else {
        value.V = current;
        count--;
    }

    return [err, value, () => void 0];
}

export async function waitForAsyncData() {
    while (count > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}
