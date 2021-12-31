import { Extension } from "./node";
import { Destroyable } from "../core/destroyable";
import { Signal } from "../core/signal";
import { Slot } from "../core/slot";
/**
 * Interceptor is designed to connect signals & methods of children elements
 * @class Interceptor
 * @extends Destroyable
 */
export declare class Interceptor<t1 = void, t2 = void, t3 = void, t4 = void, t5 = void, t6 = void, t7 = void, t8 = void, t9 = void> extends Destroyable {
    /**
     * Set of signals
     * @type Set
     */
    signals: Set<Signal<t1, t2, t3, t4, t5, t6, t7, t8, t9>>;
    /**
     * Set of handlers
     * @type Set
     */
    handlers: Set<(a1: t1, a2: t2, a3: t3, a4: t4, a5: t5, a6: t6, a7: t7, a8: t8, a9: t9) => void>;
    /**
     * Connect a signal or a handler
     * @param thing {Signal | function}
     */
    connect(thing: Signal<t1, t2, t3, t4, t5, t6, t7, t8, t9> | ((a1: t1, a2: t2, a3: t3, a4: t4, a5: t5, a6: t6, a7: t7, a8: t8, a9: t9) => void)): void;
    /**
     * Disconnect a handler from signals
     * @param handler {function}
     */
    disconnect(handler: (a1: t1, a2: t2, a3: t3, a4: t4, a5: t5, a6: t6, a7: t7, a8: t8, a9: t9) => void): void;
    $destroy(): void;
}
/**
 * Interceptor node to implement directly to vasille DOM
 * @class InterceptorNode
 * @extends Extension
 */
export declare class InterceptorNode<t1 = void, t2 = void, t3 = void, t4 = void, t5 = void, t6 = void, t7 = void, t8 = void, t9 = void> extends Extension {
    /**
     * Internal interceptor
     * @type Interceptor
     */
    interceptor: Interceptor<t1, t2, t3, t4, t5, t6, t7, t8, t9>;
    /**
     * The default slot of node
     * @type Slot
     */
    slot: Slot<Interceptor<t1, t2, t3, t4, t5, t6, t7, t8, t9>>;
    $compose(): void;
}
