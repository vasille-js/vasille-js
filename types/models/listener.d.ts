/**
 * Represent a listener for a model
 * @class Listener
 */
export declare class Listener<ValueT, IndexT = string | number> {
    /**
     * Functions to run on adding new items
     * @type Set
     */
    private readonly onAdded;
    /**
     * Functions to run on item removing
     * @type Set
     */
    private readonly onRemoved;
    /**
     * Describe the frozen state of model
     * @type boolean
     * @private
     */
    private frozen;
    /**
     * The queue of operations in frozen state
     * @type Object[]
     * @private
     */
    private readonly queue;
    constructor();
    /**
     * Exclude the repeated operation in queue
     * @private
     */
    private excludeRepeat;
    /**
     * Emits added event to listeners
     * @param index {*} index of value
     * @param value {*} value of added item
     */
    emitAdded(index: IndexT, value: ValueT): void;
    /**
     * Emits removed event to listeners
     * @param index {*} index of removed value
     * @param value {*} value of removed item
     */
    emitRemoved(index: IndexT, value: ValueT): void;
    /**
     * Adds a handler to added event
     * @param handler {function} function to run on event emitting
     */
    onAdd(handler: (index: IndexT, value: ValueT) => void): void;
    /**
     * Adds a handler to removed event
     * @param handler {function} function to run on event emitting
     */
    onRemove(handler: (index: IndexT, value: ValueT) => void): void;
    /**
     * Removes an handler from added event
     * @param handler {function} handler to remove
     */
    offAdd(handler: (index: IndexT, value: ValueT) => void): void;
    /**
     * Removes an handler form removed event
     * @param handler {function} handler to remove
     */
    offRemove(handler: (index: IndexT, value: ValueT) => void): void;
    /**
     * Run all queued operation and enable reactivity
     */
    enableReactivity(): void;
    /**
     * Disable the reactivity and enable the queue
     */
    disableReactivity(): void;
}
