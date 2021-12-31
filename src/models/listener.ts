/**
 * Represent a listener for a model
 * @class Listener
 */
export class Listener<ValueT, IndexT = string | number> {
    /**
     * Functions to run on adding new items
     * @type Set
     */
    private onAdded : Set<(index : IndexT, value : ValueT) => void>;

    /**
     * Functions to run on item removing
     * @type Set
     */
    private onRemoved : Set<(index : IndexT, value : ValueT) => void>;

    /**
     * Describe the frozen state of model
     * @type boolean
     * @private
     */
    private frozen : boolean;

    /**
     * The queue of operations in frozen state
     * @type Object[]
     * @private
     */
    private queue : { sign: boolean, index: IndexT, value: ValueT }[];

    public constructor () {
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

    /**
     * Exclude the repeated operation in queue
     * @private
     */
    private excludeRepeat (index : IndexT) : boolean {
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
     * @param index {*} index of value
     * @param value {*} value of added item
     */
    public emitAdded (index : IndexT, value : ValueT) {
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
     * @param index {*} index of removed value
     * @param value {*} value of removed item
     */
    public emitRemoved (index : IndexT, value : ValueT) {
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
     * Adds a handler to added event
     * @param handler {function} function to run on event emitting
     */
    public onAdd (handler : (index : IndexT, value : ValueT) => void) {
        this.onAdded.add(handler);
    }

    /**
     * Adds a handler to removed event
     * @param handler {function} function to run on event emitting
     */
    public onRemove (handler : (index : IndexT, value : ValueT) => void) {
        this.onRemoved.add(handler);
    }

    /**
     * Removes an handler from added event
     * @param handler {function} handler to remove
     */
    public offAdd (handler : (index : IndexT, value : ValueT) => void) {
        this.onAdded.delete(handler);
    }

    /**
     * Removes an handler form removed event
     * @param handler {function} handler to remove
     */
    public offRemove (handler : (index : IndexT, value : ValueT) => void) {
        this.onRemoved.delete(handler);
    }

    /**
     * Run all queued operation and enable reactivity
     */
    public enableReactivity () {
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

    /**
     * Disable the reactivity and enable the queue
     */
    public disableReactivity () {
        this.frozen = true;
    }
}
