/**
 * Represent a listener for a model
 * @class Listener
 */
export class Listener<ValueT, IndexT = string | number> {
    /**
     * Functions to run on adding new items
     * @type Set
     */
    private readonly onAdded: Set<(index: IndexT, value: ValueT) => void> = new Set();

    /**
     * Functions to run on item removing
     * @type Set
     */
    private readonly onRemoved: Set<(index: IndexT, value: ValueT) => void> = new Set();

    /**
     * Emits added event to listeners
     * @param index {*} index of value
     * @param value {*} value of added item
     */
    public emitAdded(index: IndexT, value: ValueT) {
        this.onAdded.forEach(handler => {
            handler(index, value);
        });
    }

    /**
     * Emits removed event to listeners
     * @param index {*} index of removed value
     * @param value {*} value of removed item
     */
    public emitRemoved(index: IndexT, value: ValueT) {
        this.onRemoved.forEach(handler => {
            handler(index, value);
        });
    }

    /**
     * Adds a handler to added event
     * @param handler {function} function to run on event emitting
     */
    public onAdd(handler: (index: IndexT, value: ValueT) => void) {
        this.onAdded.add(handler);
    }

    /**
     * Adds a handler to removed event
     * @param handler {function} function to run on event emitting
     */
    public onRemove(handler: (index: IndexT, value: ValueT) => void) {
        this.onRemoved.add(handler);
    }

    /**
     * Removes an handler from added event
     * @param handler {function} handler to remove
     */
    public offAdd(handler: (index: IndexT, value: ValueT) => void) {
        this.onAdded.delete(handler);
    }

    /**
     * Removes an handler form removed event
     * @param handler {function} handler to remove
     */
    public offRemove(handler: (index: IndexT, value: ValueT) => void) {
        this.onRemoved.delete(handler);
    }
}
