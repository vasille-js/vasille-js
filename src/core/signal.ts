/**
 * Signal is an event generator
 * @class Signal
 */
export class Signal<
    T1 = void,
    T2 = void,
    T3 = void,
    T4 = void,
    T5 = void,
    T6 = void,
    T7 = void,
    T8 = void,
    T9 = void
    > {
    /**
     * Handler of event
     * @type {Set}
     * @private
     */
    private handlers : Set<
        (a1 : T1, a2 : T2, a3 : T3, a4 : T4, a5 : T5, a6 : T6, a7 : T7, a8 : T8, a9 : T9) => void
        > = new Set;

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
    public emit (a1 : T1, a2 : T2, a3 : T3, a4 : T4, a5 : T5, a6 : T6, a7 : T7, a8 : T8, a9 : T9) {
        for (let handler of this.handlers) {
            try {
                handler (a1, a2, a3, a4, a5, a6, a7, a8, a9);
            } catch (e) {
                console.error (`Vasille.js: Handler throw exception: `, e);
            }
        }
    }

    /**
     * Subscribe to event
     * @param func {function} handler
     */
    public subscribe (
        func : (a1 : T1, a2 : T2, a3 : T3, a4 : T4, a5 : T5, a6 : T6, a7 : T7, a8 : T8, a9 : T9) => void
    ) {
        this.handlers.add (func);
    }

    /**
     * Unsubscribe from event
     * @param func {function} handler
     */
    public unsubscribe (
        func : (a1 : T1, a2 : T2, a3 : T3, a4 : T4, a5 : T5, a6 : T6, a7 : T7, a8 : T8, a9 : T9) => void
    ) {
        this.handlers.delete (func);
    }
}
