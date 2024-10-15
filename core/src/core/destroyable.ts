/**
 * Mark an object which can be destroyed
 * @class Destroyable
 */
export class Destroyable {
    /**
     * Make object fields non configurable
     * @protected
     */
    protected $seal() {
        const $ = this as never as { [key: string]: unknown };

        Object.keys($).forEach(i => {
            // eslint-disable-next-line no-prototype-builtins
            if (this.hasOwnProperty(i)) {
                const config = Object.getOwnPropertyDescriptor($, i);

                if (config.configurable) {
                    let descriptor: PropertyDescriptor;

                    if (config.set || config.get) {
                        descriptor = {
                            configurable: false,
                            get: config.get,
                            set: config.set,
                            enumerable: config.enumerable,
                        };
                    } else {
                        descriptor = {
                            value: $[i],
                            configurable: false,
                            writable: config.writable,
                            enumerable: config.enumerable,
                        };
                    }

                    Object.defineProperty($, i, descriptor);
                }
            }
        });
    }

    /**
     * Garbage collector method
     */
    public $destroy(): void {
        // nothing here
    }
}
