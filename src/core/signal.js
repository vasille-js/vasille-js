// @flow

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
    handlers : Set<
        (a1 : T1, a2 : T2, a3 : T3, a4 : T4, a5 : T5, a6 : T6, a7 : T7, a8 : T8, a9 : T9) => void
        > = new Set;

    emit (a1 : T1, a2 : T2, a3 : T3, a4 : T4, a5 : T5, a6 : T6, a7 : T7, a8 : T8, a9 : T9) {
        for (let handler of this.handlers) {
            try {
                handler (a1, a2, a3, a4, a5, a6, a7, a8, a9);
            } catch (e) {
                console.error (`Vasille.js: Handler throw exception: `, e);
            }
        }
    }

    subscribe (
        func : (a1 : T1, a2 : T2, a3 : T3, a4 : T4, a5 : T5, a6 : T6, a7 : T7, a8 : T8, a9 : T9) => void
    ) {
        this.handlers.add (func);
    }

    unsubscribe (
        func : (a1 : T1, a2 : T2, a3 : T3, a4 : T4, a5 : T5, a6 : T6, a7 : T7, a8 : T8, a9 : T9) => void
    ) {
        this.handlers.delete (func);
    }
}
