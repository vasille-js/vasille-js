//@flow
import { Extension } from "./node";
import { Destroyable } from "../core/destroyable";
import { Signal } from "../core/signal";
import { Slot } from "../core/slot";

export class Interceptor<
        t1 = void, t2 = void, t3 = void, t4 = void, t5 = void, t6 = void, t7 = void, t8 = void, t9 = void
    > extends Destroyable {

    signals : Set<Signal<t1, t2, t3, t4, t5, t6, t7, t8, t9>> = new Set;
    handlers : Set<(a1 : t1, a2 : t2, a3 : t3, a4 : t4, a5 : t5, a6 : t6, a7 : t7, a8 : t8, a9 : t9) => void> = new Set;

    connect (
        thing : Signal<t1, t2, t3, t4, t5, t6, t7, t8, t9> |
        ((a1 : t1, a2 : t2, a3 : t3, a4 : t4, a5 : t5, a6 : t6, a7 : t7, a8 : t8, a9 : t9) => void)
    ) {
        // interceptor will connect signals and handlers together
        if (thing instanceof Signal) {
            this.handlers.forEach(handler => {
                thing.subscribe(handler);
            });
            this.signals.add(thing);
        }
        else {
            this.signals.forEach(signal => {
                signal.subscribe(thing);
            });
            this.handlers.add(thing);
        }
    }

    disconnect (
        handler : (a1 : t1, a2 : t2, a3 : t3, a4 : t4, a5 : t5, a6 : t6, a7 : t7, a8 : t8, a9 : t9) => void
    ) {
        this.signals.forEach(signal => {
            signal.unsubscribe (handler);
        });
    }

    $destroy () {
        super.$destroy ();

        this.signals.forEach(signal => {
            this.handlers.forEach(handler => {
                signal.unsubscribe(handler);
            });
        });
    }
}

export class InterceptorNode<
    t1 = void, t2 = void, t3 = void, t4 = void, t5 = void, t6 = void, t7 = void, t8 = void, t9 = void
> extends Extension {
    interceptor : Interceptor<t1, t2, t3, t4, t5, t6, t7, t8, t9> = new Interceptor;
    slot : Slot<Interceptor<t1, t2, t3, t4, t5, t6, t7, t8, t9>> = new Slot;

    $compose () {
        this.slot.release(this, this.interceptor);
    }
}
