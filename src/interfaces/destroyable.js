// @flow

/**
 * Mark an object which can be destroyed
 * @interface
 */
export class Destroyable {
    /**
     * Garbage collector method
     */
    $destroy () : void {
    }
}
