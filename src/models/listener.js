// @flow


/**
 * Represent a listener for a model
 */
export class Listener<ValueT, IndexT = string | number> {
    /**
     * Functions to run on adding new items
     * @type {Set<Function>}
     */
    onAdded : Set<(index : IndexT, value : ValueT) => void>;

    /**
     * Functions to run on item removing
     * @type {Set<Function>}
     */
    onRemoved : Set<(index : IndexT, value : ValueT) => void>;

    frozen : boolean;
    queue : { sign: boolean, index: IndexT, value: ValueT }[];

    constructor () {
        Object.defineProperties(this, {
            onAdded: {
                value: new Set,
                writable: false,
                configurable: false
            },
            onRemoved: {
                value: new Set,
                writable: false,
                configurable: false
            },
            frozen: {
                value: false,
                configurable: false
            },
            queue: {
                value: [],
                writable: false,
                configurable: false
            }
        });
    }

    excludeRepeat (index : IndexT) : boolean {
        this.queue.forEach((item, i) => {
            if (item.index === index) {
                this.queue.splice(i, 1);
                return true;
            }
        });

        return false;
    }

    /**
     * Emits added event to listeners
     * @param index {number | string | *} index of value
     * @param value {IValue} value of added item
     */
    emitAdded (index : IndexT, value : ValueT) {
        if (this.frozen) {
            if (!this.excludeRepeat(index)) {
                this.queue.push({ sign: true, index, value });
            }
        }
        else {
            for (let handler of this.onAdded) {
                handler(index, value);
            }
        }
    }

    /**
     * Emits removed event to listeners
     * @param index {number | string | *} index of removed value
     * @param value {IValue} value of removed item
     */
    emitRemoved (index : IndexT, value : ValueT) {
        if (this.frozen) {
            if (!this.excludeRepeat(index)) {
                this.queue.push({ sign: false, index, value });
            }
        }
        else {
            for (let handler of this.onRemoved) {
                handler(index, value);
            }
        }
    }

    /**
     * Adds an handler to added event
     * @param handler {Function} function to run on event emitting
     */
    onAdd (handler : (index : IndexT, value : ValueT) => void) {
        this.onAdded.add(handler);
    }

    /**
     * Adds an handler to removed event
     * @param handler {Function} function to run on event emitting
     */
    onRemove (handler : (index : IndexT, value : ValueT) => void) {
        this.onRemoved.add(handler);
    }

    /**
     * Removes an handler from added event
     * @param handler {Function} handler to remove
     */
    offAdd (handler : (index : IndexT, value : ValueT) => void) {
        this.onAdded.delete(handler);
    }

    /**
     * Removes an handler form removed event
     * @param handler {Function} handler to remove
     */
    offRemove (handler : (index : IndexT, value : ValueT) => void) {
        this.onRemoved.delete(handler);
    }

    enableReactivity () {
        this.queue.forEach(item => {
            if (item.sign) {
                this.onAdded.forEach(handler => {
                    handler(item.index, item.value);
                });
            }
            else {
                this.onRemoved.forEach(handler => {
                    handler(item.index, item.value);
                });
            }
        });
        this.queue.splice(0);
        this.frozen = false;
    }

    disableReactivity () {
        this.frozen = true;
    }
}
