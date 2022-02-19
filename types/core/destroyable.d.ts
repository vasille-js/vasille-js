/**
 * Mark an object which can be destroyed
 * @class Destroyable
 */
export declare class Destroyable {
    /**
     * Make object fields non configurable
     * @protected
     */
    protected seal(): void;
    /**
     * Garbage collector method
     */
    destroy(): void;
}
