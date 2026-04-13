import { Fragment } from "../node/node.js";

/**
 * Represent a listener for a model
 * @class Listener
 */
export class Listener<Arguments extends unknown[]> {
    /**
     * Functions to run on adding new items
     * @type Set
     */
    private readonly handlers: Set<(...args: Arguments) => void> = new Set();

    /**
     * Emits added event to listeners
     */
    public emit(...args: Arguments) {
        this.handlers.forEach(handler => {
            handler(...args);
        });
    }

    /**
     * Adds a handler to added event
     * @param handler {function} function to run on event emitting
     */
    public on(handler: (...args: Arguments) => void) {
        this.handlers.add(handler);
    }

    /**
     * Removes a handler from added event
     * @param handler {function} handler to remove
     */
    public off(handler: (...args: Arguments) => void) {
        this.handlers.delete(handler);
    }
}

export function removeFragmentFromTree(fragment: Fragment<unknown, unknown, object>) {
    const { next, prev, parent } = fragment;

    if (next) {
        next.prev = prev;
    }
    /* istanbul ignore else */
    if (prev) {
        prev.next = next;
    }
    if (parent.lastChild === fragment) {
        parent.lastChild = prev;
    }
}
