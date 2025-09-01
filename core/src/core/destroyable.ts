/**
 * Mark an object which can be destroyed
 * @interface Destroyable
 */
export interface Destroyable {
    /**
     * Garbage collector method
     */
    destroy(): void;
}
