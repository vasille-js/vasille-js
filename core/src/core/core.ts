import { Destroyable } from "./destroyable.js";

/**
 * A reactive object
 * @class Reactive
 * @extends Destroyable
 */
export class Reactive implements Destroyable {
    /**
     * A list of user-defined bindings
     */
    private linked: Destroyable[] = [];
    private onDestroy?: () => void;

    public bind<T extends Destroyable>(value: T): void {
        this.linked.push(value);
    }

    public runOnDestroy(func: () => void) {
        if (this.onDestroy) {
            console.warn(new Error("You rewrite onDestroy existing handler"));
            console.log(this.onDestroy);
        }
        this.onDestroy = func;
    }

    public destroy() {
        this.onDestroy?.();
        this.linked.splice(0);
    }
}
