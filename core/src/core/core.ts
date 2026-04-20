import { safe } from "../functional/safety.js";
import { Destroyable } from "./destroyable.js";

/**
 * A reactive object
 * @class Reactive
 * @extends Destroyable
 */
export class Reactive implements Destroyable {
    public readonly sDeep: number;
    public rDeep: number;

    public constructor(deep: number) {
        this.sDeep = this.rDeep = deep;
    }
    /**
     * A list of user-defined bindings
     */
    private linked?: Destroyable[];
    private onDestroy?: () => void;

    public bind<T extends Destroyable & { rDeep: number }>(value: T): void {
        if (this.linked) {
            this.linked.push(value);
        } else {
            this.linked = [value];
        }
        if (this.rDeep > value.rDeep) {
            this.refreshDeep(value.rDeep);
        }
    }

    public refreshDeep(deep: number) {
        this.rDeep = deep;
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
        // this component needs manual destruction
        this.refreshDeep(0);
    }

    public destroy(deep: number) {
        this.onDestroy?.();
        if (this.rDeep < deep) {
            this.linked?.forEach(item => {
                item.destroy(deep);
            });
        }
    }
}
