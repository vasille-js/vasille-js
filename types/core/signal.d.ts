/**
 * Signal is an event generator
 * @class Signal
 */
export declare class Signal<T1 = void, T2 = void, T3 = void, T4 = void, T5 = void, T6 = void, T7 = void, T8 = void, T9 = void> {
    /**
     * Handler of event
     * @type {Set}
     * @private
     */
    private handlers;
    /**
     * Emit event
     * @param a1 {*} argument
     * @param a2 {*} argument
     * @param a3 {*} argument
     * @param a4 {*} argument
     * @param a5 {*} argument
     * @param a6 {*} argument
     * @param a7 {*} argument
     * @param a8 {*} argument
     * @param a9 {*} argument
     */
    emit(a1: T1, a2: T2, a3: T3, a4: T4, a5: T5, a6: T6, a7: T7, a8: T8, a9: T9): void;
    /**
     * Subscribe to event
     * @param func {function} handler
     */
    subscribe(func: (a1: T1, a2: T2, a3: T3, a4: T4, a5: T5, a6: T6, a7: T7, a8: T8, a9: T9) => void): void;
    /**
     * Unsubscribe from event
     * @param func {function} handler
     */
    unsubscribe(func: (a1: T1, a2: T2, a3: T3, a4: T4, a5: T5, a6: T6, a7: T7, a8: T8, a9: T9) => void): void;
}
