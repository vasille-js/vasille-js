/**
 * Mark an object which can be destroyed
 * @class Destroyable
 */
export class Destroyable {

    /**
     * Make object fields non configurable
     * @protected
     */
    protected $seal () {
        const $ = this as never as { [key : string] : unknown };

        for (const i in $) {
            // eslint-disable-next-line no-prototype-builtins
            if (this.hasOwnProperty(i)) {
                const config = Object.getOwnPropertyDescriptor($, i);

                if (!config || config.configurable) {
                    Object.defineProperty($, i, config?.set || config?.get ? {
                        configurable: false,
                        get: config?.get,
                        set: config?.set,
                        enumerable: config?.enumerable ?? false
                    } : {
                        value: $[i],
                        configurable: false,
                        writable: config?.writable ?? false,
                        enumerable: config?.enumerable ?? false
                    });
                }
            }
        }
    }
    
    /**
     * Garbage collector method
     */
    public $destroy () : void {
        // nothing here
    }
}
