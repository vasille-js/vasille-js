/**
 * Mark an object which can be destroyed
 * @class
 */
export class Destroyable {
    protected $seal () {
        let $ : Object = this;

        for (let i in $) {
            if (this.hasOwnProperty(i)) {
                let config = Object.getOwnPropertyDescriptor($, i);

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
    }
}
