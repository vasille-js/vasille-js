// @flow

/**
 * Mark an object which can be destroyed
 * @interface
 */
export class Destroyable {
    seal () {
        let $ : Object = this;

        for (let i in $) {
            if (this.hasOwnProperty(i)) {
                let config = Object.getOwnPropertyDescriptor($, i);

                if (!config || config.configurable) {
                    Object.defineProperty($, i, {
                        value: $[i],
                        configurable: false,
                        writable: config?.writable ?? false,
                        get: config?.get,
                        set: config?.set,
                        enumerable: config?.enumerable ?? false
                    });
                }
            }
        }
    }
    
    /**
     * Garbage collector method
     */
    $destroy () : void {
    }
}
