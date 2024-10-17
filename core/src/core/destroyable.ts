/**
 * Mark an object which can be destroyed
 * @interface IDestroyable
 */
export interface IDestroyable {
    /**
     * Garbage collector method
     */
    destroy(): void;
}

/**
 * Mark an object which can be destroyed
 * @class Destroyable
 */
export class Destroyable implements IDestroyable {
    /**
     * Garbage collector method
     */
    destroy(): void {}
}
