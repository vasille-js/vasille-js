//@flow
import { Fragment } from "./node";
import { Destroyable } from "../core/destroyable";
import { Signal } from "../core/signal";
import { Slot } from "../core/slot";



declare export class Interceptor<
        t1 = void, t2 = void, t3 = void, t4 = void, t5 = void, t6 = void, t7 = void, t8 = void, t9 = void
    > extends Destroyable {

    signals : Set<Signal<t1, t2, t3, t4, t5, t6, t7, t8, t9>>;
    handlers : Set<(a1 : t1, a2 : t2, a3 : t3, a4 : t4, a5 : t5, a6 : t6, a7 : t7, a8 : t8, a9 : t9) => void>;

    connect (
        thing : Signal<t1, t2, t3, t4, t5, t6, t7, t8, t9> |
        (a1 : t1, a2 : t2, a3 : t3, a4 : t4, a5 : t5, a6 : t6, a7 : t7, a8 : t8, a9 : t9) => void
    ) : void;
    disconnect (
        handler : (a1 : t1, a2 : t2, a3 : t3, a4 : t4, a5 : t5, a6 : t6, a7 : t7, a8 : t8, a9 : t9) => void
    ) : void;
}

declare export class InterceptorNode<
    t1 = void, t2 = void, t3 = void, t4 = void, t5 = void, t6 = void, t7 = void, t8 = void, t9 = void
> extends Fragment {
    interceptor : Interceptor<t1, t2, t3, t4, t5, t6, t7, t8, t9>;
    slot : Slot<Interceptor<t1, t2, t3, t4, t5, t6, t7, t8, t9>>;
}
