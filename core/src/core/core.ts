import { safe } from "../functional/safety.js";
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
        const existing = this.onDestroy;

        if (existing) {
            this.onDestroy = () => {
                existing();
                safe(func)();
            };
        } else {
            this.onDestroy = safe(func);
        }
    }

    public destroy() {
        this.onDestroy?.();
        this.linked.forEach(item => item.destroy());
        this.linked.splice(0);
    }
}
