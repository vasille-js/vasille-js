import { IValue, Reference } from "vasille";

export class Expression extends IValue<unknown> {
    private readonly values: unknown[];
    private readonly valuesCache: unknown[];
    private readonly func: (i?: number) => void;
    private readonly linkedFunc: (() => void)[] = [];
    private readonly sync: Reference<unknown>;

    public constructor(func: (...args: unknown[]) => unknown, values: unknown[]) {
        super();

        const handler = (i?: number) => {
            if (typeof i === "number") {
                const dependency = this.values[i];

                if (dependency instanceof IValue) {
                    this.valuesCache[i] = dependency.$;
                } else {
                    return;
                }
            }

            this.sync.$ = func.apply(this, this.valuesCache);
        };

        this.valuesCache = values.map(item => (item instanceof IValue ? item.$ : item));
        this.sync = new Reference<unknown>(func.apply(this, this.valuesCache));

        let i = 0;

        for (const value of values) {
            const index = i++;

            if (value instanceof IValue) {
                value.on((this.linkedFunc[index] = handler.bind(this, index)));
            }
        }

        this.values = values;
        this.func = handler;

        handler();
    }

    public get $(): unknown {
        return this.sync.$;
    }

    public set $(value: unknown) {
        this.sync.$ = value;
    }

    public on(handler: (value: unknown) => void): void {
        this.sync.on(handler);
    }

    public off(handler: (value: unknown) => void) {
        this.sync.off(handler);
    }

    public destroy() {
        for (let i = 0; i < this.values.length; i++) {
            const value = this.values[i];

            if (value instanceof IValue) {
                value.off(this.linkedFunc[i]);
            }
        }
        this.values.splice(0);
        this.valuesCache.splice(0);
        this.linkedFunc.splice(0);

        super.destroy();
    }
}
