// @flow



declare module "vasille" {

    declare type AppOptions = ?{
        debugUi ?: boolean,
        freezeUi ?: boolean,
        executor ?: Executor
    }

    declare export class Destroyable {
        seal () : void;
        destroy () : void;
    }
    declare export class ReactivePrivate extends Destroyable {
        watch : Set<Switchable>;
        bindings : Set<Destroyable>;
        models: Set<IModel>;
        enabled : boolean;
        frozen : boolean;
        freezeExpr : Expression<void, boolean>;

        constructor () : void;

        destroy () : void;
    }
    declare export class Reactive extends Destroyable {
        $ : ReactivePrivate;

        constructor ($ : ?ReactivePrivate) : void;

        ref<T> (value : T) : IValue<T>;
        mirror<T> (value : IValue<T>) : Mirror<T>;
        forward<T> (value : IValue<T>) : Mirror<T>;
        point<T>(value: IValue<T>, forwardOnly?: boolean): Pointer<T>;
        register<T>(model: T): T;

        watch<T1> (
            func : (a1 : T1) => void,
            v1: IValue<T1>,
        ) : void;
        watch<T1, T2> (
            func : (a1 : T1, a2 : T2) => void,
            v1: IValue<T1>, v2: IValue<T2>,
        ) : void;
        watch<T1, T2, T3> (
            func : (a1 : T1, a2 : T2, a3 : T3) => void,
            v1: IValue<T1>, v2: IValue<T2>, v3: IValue<T3>,
        ) : void;
        watch<T1, T2, T3, T4> (
            func : (a1 : T1, a2 : T2, a3 : T3, a4 : T4) => void,
            v1: IValue<T1>, v2: IValue<T2>, v3: IValue<T3>,
            v4: IValue<T4>,
        ) : void;
        watch<T1, T2, T3, T4, T5> (
            func : (a1 : T1, a2 : T2, a3 : T3, a4 : T4, a5 : T5) => void,
            v1: IValue<T1>, v2: IValue<T2>, v3: IValue<T3>,
            v4: IValue<T4>, v5: IValue<T5>,
        ) : void;
        watch<T1, T2, T3, T4, T5, T6> (
            func : (a1 : T1, a2 : T2, a3 : T3, a4 : T4, a5 : T5, a6 : T6) => void,
            v1: IValue<T1>, v2: IValue<T2>, v3: IValue<T3>,
            v4: IValue<T4>, v5: IValue<T5>, v6: IValue<T6>,
        ) : void;
        watch<T1, T2, T3, T4, T5, T6, T7> (
            func : (a1 : T1, a2 : T2, a3 : T3, a4 : T4, a5 : T5, a6 : T6, a7 : T7) => void,
            v1: IValue<T1>, v2: IValue<T2>, v3: IValue<T3>,
            v4: IValue<T4>, v5: IValue<T5>, v6: IValue<T6>,
            v7: IValue<T7>,
        ) : void;
        watch<T1, T2, T3, T4, T5, T6, T7, T8> (
            func : (a1 : T1, a2 : T2, a3 : T3, a4 : T4, a5 : T5, a6 : T6, a7 : T7, a8 : T8) => void,
            v1: IValue<T1>, v2: IValue<T2>, v3: IValue<T3>,
            v4: IValue<T4>, v5: IValue<T5>, v6: IValue<T6>,
            v7: IValue<T7>, v8: IValue<T8>,
        ) : void;
        watch<T1, T2, T3, T4, T5, T6, T7, T8, T9> (
            func : (a1 : T1, a2 : T2, a3 : T3, a4 : T4, a5 : T5, a6 : T6, a7 : T7, a8 : T8, a9 : T9) => void,
            v1: IValue<T1>, v2: IValue<T2>, v3: IValue<T3>,
            v4: IValue<T4>, v5: IValue<T5>, v6: IValue<T6>,
            v7: IValue<T7>, v8: IValue<T8>, v9: IValue<T9>,
        ) : void;

        bind<T, T1> (
            func : (a1 : T1) => T,
            v1: IValue<T1>,
        ) : IValue<T>;
        bind<T, T1, T2> (
            func : (a1 : T1, a2 : T2) => T,
            v1: IValue<T1>, v2: IValue<T2>,
        ) : IValue<T>;
        bind<T, T1, T2, T3> (
            func : (a1 : T1, a2 : T2, a3 : T3) => T,
            v1: IValue<T1>, v2: IValue<T2>, v3: IValue<T3>,
        ) : IValue<T>;
        bind<T, T1, T2, T3, T4> (
            func : (a1 : T1, a2 : T2, a3 : T3, a4 : T4) => T,
            v1: IValue<T1>, v2: IValue<T2>, v3: IValue<T3>,
            v4: IValue<T4>,
        ) : IValue<T>;
        bind<T, T1, T2, T3, T4, T5> (
            func : (a1 : T1, a2 : T2, a3 : T3, a4 : T4, a5 : T5) => T,
            v1: IValue<T1>, v2: IValue<T2>, v3: IValue<T3>,
            v4: IValue<T4>, v5: IValue<T5>,
        ) : IValue<T>;
        bind<T, T1, T2, T3, T4, T5, T6> (
            func : (a1 : T1, a2 : T2, a3 : T3, a4 : T4, a5 : T5, a6 : T6) => T,
            v1: IValue<T1>, v2: IValue<T2>, v3: IValue<T3>,
            v4: IValue<T4>, v5: IValue<T5>, v6: IValue<T6>,
        ) : IValue<T>;
        bind<T, T1, T2, T3, T4, T5, T6, T7> (
            func : (a1 : T1, a2 : T2, a3 : T3, a4 : T4, a5 : T5, a6 : T6, a7 : T7) => T,
            v1: IValue<T1>, v2: IValue<T2>, v3: IValue<T3>,
            v4: IValue<T4>, v5: IValue<T5>, v6: IValue<T6>,
            v7: IValue<T7>,
        ) : IValue<T>;
        bind<T, T1, T2, T3, T4, T5, T6, T7, T8> (
            func : (a1 : T1, a2 : T2, a3 : T3, a4 : T4, a5 : T5, a6 : T6, a7 : T7, a8 : T8) => T,
            v1: IValue<T1>, v2: IValue<T2>, v3: IValue<T3>,
            v4: IValue<T4>, v5: IValue<T5>, v6: IValue<T6>,
            v7: IValue<T7>, v8: IValue<T8>,
        ) : IValue<T>;
        bind<T, T1, T2, T3, T4, T5, T6, T7, T8, T9> (
            func : (a1 : T1, a2 : T2, a3 : T3, a4 : T4, a5 : T5, a6 : T6, a7 : T7, a8 : T8, a9 : T9) => T,
            v1: IValue<T1>, v2: IValue<T2>, v3: IValue<T3>,
            v4: IValue<T4>, v5: IValue<T5>, v6: IValue<T6>,
            v7: IValue<T7>, v8: IValue<T8>, v9: IValue<T9>,
        ) : IValue<T>;

        enable () : void;
        disable () : void;
        bindAlive(cond: IValue<boolean>, onOff?: () => void, onOn?: () => void): this;
        destroy () : void;
    }
    declare export class Executor {
        addClass (el : Element, cl : string) : void;
        removeClass (el : Element, cl : string) : void;
        setAttribute (el : Element, name : string, value : string) : void;
        removeAttribute (el : Element, name : string) : void;
        setStyle (el : HTMLElement, prop : string, value : string) : void;
        insertBefore (target : Node, child : Node) : void;
        appendChild (el : Element, child : Node) : void;
        callCallback (cb : () => void) : void;
    }
    declare export class InstantExecutor extends Executor {
    }
    declare export class TimeoutExecutor extends InstantExecutor {
    }
    declare export class Switchable extends Destroyable {
        enable(): void;
        disable(): void;
    }
    declare export class IValue<T> extends Destroyable {
        isEnabled : boolean;

        constructor (isEnabled ?: boolean) : void;
        get $ () : T;
        set $ (value : T) : this;
        on (handler : (value : T) => void) : this;
        off (handler : (value : T) => void) : this;
    }
    declare export class Signal<
        T = Fragment, T1 = void, T2 = void, T3 = void, T4 = void, T5 = void, T6 = void, T7 = void, T8 = void, T9 = void
        > {
        handlers : Set<
            (a1 : T1, a2 : T2, a3 : T3, a4 : T4, a5 : T5, a6 : T6, a7 : T7, a8 : T8, a9 : T9) => void
            >;

        emit (a1 : T1, a2 : T2, a3 : T3, a4 : T4, a5 : T5, a6 : T6, a7 : T7, a8 : T8, a9 : T9) : void;
        subscribe (
            func : (a1 : T1, a2 : T2, a3 : T3, a4 : T4, a5 : T5, a6 : T6, a7 : T7, a8 : T8, a9 : T9) => void
        ) : void;
        unsubscribe (
            func : (a1 : T1, a2 : T2, a3 : T3, a4 : T4, a5 : T5, a6 : T6, a7 : T7, a8 : T8, a9 : T9) => void
        ) : void;
    }
    declare export class Slot<
        T = Fragment, t1 = void, t2 = void, t3 = void, t4 = void, t5 = void, t6 = void, t7 = void, t8 = void, t9 = void
        > {
        runner : ?(a0 : T, a1 : t1, a2 : t2, a3 : t3, a4 : t4, a5 : t5, a6 : t6, a7 : t7, a8 : t8, a9 : t9) => void;

        insert (
            func : (a0 : T, a1 : t1, a2 : t2, a3 : t3, a4 : t4, a5 : t5, a6 : t6, a7 : t7, a8 : t8, a9 : t9) => void
        ) : void;
        release (
            a0 : T, a1 : t1, a2 : t2, a3 : t3, a4 : t4, a5 : t5, a6 : t6, a7 : t7, a8 : t8, a9 : t9
        ) : void;
        predefine (
            func : (a0 : T, a1 : t1, a2 : t2, a3 : t3, a4 : t4, a5 : t5, a6 : t6, a7 : t7, a8 : t8, a9 : t9) => void,
            a0 : T, a1 : t1, a2 : t2, a3 : t3, a4 : t4, a5 : t5, a6 : t6, a7 : t7, a8 : t8, a9 : t9
        ) : void;
    }
    declare export class Listener<ValueT, IndexT = string | number> {
        onAdded : Set<(index : IndexT, value : ValueT) => void>;
        onRemoved : Set<(index : IndexT, value : ValueT) => void>;
        frozen : boolean;
        queue : { sign: boolean, index: IndexT, value: ValueT }[];

        constructor () : void;
        excludeRepeat (index : IndexT) : boolean;
        emitAdded (index : IndexT, value : ValueT) : void;
        emitRemoved (index : IndexT, value : ValueT) : void;
        onAdd (handler : (index : IndexT, value : ValueT) => void) : void;
        onRemove (handler : (index : IndexT, value : ValueT) => void) : void;
        offAdd (handler : (index : IndexT, value : ValueT) => void) : void;
        offRemove (handler : (index : IndexT, value : ValueT) => void) : void;
        enableReactivity () : void;
        disableReactivity () : void;
    }
    declare interface IModel {
        enableReactivity () : void;
        disableReactivity () : void;
    }
    declare export class ArrayModel<T> extends Array<T> implements IModel {
        listener : Listener<T, ?T>;
        constructor (data ?: Array<T>) : void;
        get last () : ?T;
        fill (value : T, start : ?number, end : ?number) : this;
        pop () : T;
        push (...items : Array<T>) : number;
        shift () : T;
        splice (
            start : number,
            deleteCount : ?number,
            ...items : Array<T>
        ) : ArrayModel<T>;
        unshift (...items : Array<T>) : number;
        append (v : T) : this;
        clear () : this;
        insert (index : number, v : T) : this;
        prepend (v : T) : this;
        removeAt (index : number) : this;
        removeFirst () : this;
        removeLast () : this;
        removeOne (v : T) : this;
        enableReactivity () : void;
        disableReactivity () : void;
    }
    declare export class MapModel<K, T> extends Map<K, T> implements IModel {
        listener : Listener<T, K>;

        constructor (map ?: [K, T][]) : void;
        clear () : void;
        delete (key : any) : boolean;
        set (key : K, value : T) : this;
        enableReactivity () : void;
        disableReactivity () : void;
    }
    declare export class ObjectModel<T> extends Object implements IModel {
        listener : Listener<T, string>;

        constructor (obj ?: { [p : string] : T }) : void;
        get (key : string) : T;
        set (key : string, v : T) : this;
        delete (key : string) : void;
        enableReactivity () : void;
        disableReactivity () : void;
    }
    declare export class SetModel<T> extends Set<T> implements IModel {
        listener : Listener<T, T>;

        constructor (set ?: T[]) : void;
        add (value : T) : this;
        clear () : void;
        delete (value : T) : boolean;
        enableReactivity () : void;
        disableReactivity () : void;
    }
    declare export class AppNode extends INode {
        run : Executor;

        constructor (options : AppOptions) : void;
        $appendNode(node: Node): void;
    }
    declare export class App extends AppNode {
        constructor (node : HTMLElement, options : AppOptions) : void;
    }
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
        slot : Slot<Fragment, Interceptor<t1, t2, t3, t4, t5, t6, t7, t8, t9>>;
    }
    declare export class FragmentPrivate extends ReactivePrivate {

        app : AppNode;
        parent : Fragment;
        next : ?Fragment;
        prev : ?Fragment;

        constructor () : void;
        preinit (app : AppNode, parent: Fragment) : void;
    }
    declare export class Fragment extends Reactive {
        children : Array<Fragment>;

        constructor ($ : ?FragmentPrivate) : void;

        preinit (app: AppNode, parent : Fragment, data ?: any) : void;
        init () : this;
        created () : void;
        mounted () : void;
        ready () : void;
        createSignals () : void;
        createWatchers () : void;
        compose () : void;
        $pushNode (node : Fragment) : void;
        $findFirstChild () : ?Node;
        $appendNode (node : Node) : void ;
        $insertAdjacent (node : Node) : void;
        text (
            text : string | IValue<string>,
            cb : ?(text : TextNode) => void
        ) : this;
        debug(text : IValue<string>) : this;
        tag<T = Element> (
            tagName : string,
            cb ?: (node : Tag, element : T) => void
        ) : this;
        create<T> (
            node : T,
            callback ?: ($ : T) => void,
            callback1 ?: ($ : T) => void
        ) : this;
        if (
            cond : IValue<boolean>,
            cb : (node : Fragment) => void
        ) : this ;
        if_else (
            ifCond : IValue<boolean>,
            ifCb : (node : Fragment) => void,
            elseCb : (node : Fragment) => void
        ) : this;
        switch (
            ...cases : Array<{ cond : IValue<boolean>, cb : (node : Fragment) => void }>
        ) : this;
        case (cond : IValue<boolean>, cb : (node : Fragment) => void)
            : {cond : IValue<boolean>, cb : (node : Fragment) => void};
        insertBefore(node: Fragment): void;
        insertAfter(node: Fragment): void;
        remove(): void;
        default (cb: (node : Fragment) => void)
            : {cond : IValue<boolean>, cb : (node : Fragment) => void};
    }
    declare export class TextNodePrivate extends FragmentPrivate {
        node : Text;

        constructor () : void;
        preinitText (app : AppNode, parent: Fragment, text : IValue<string>) : void;
    }
    declare export class TextNode extends Fragment {
        constructor () : void;

        preinit (app : AppNode, parent : Fragment, text : ?IValue<string>) : void;
    }
    declare export class INodePrivate extends FragmentPrivate {

        unmounted : boolean;
        node : Element;

        constructor () : void;
    }
    declare export class INode extends Fragment {

        constructor ($ : ?INodePrivate) : void;
        init () : this;
        createAttrs () : void;
        createStyle () : void;
        attr (name : string, value : IValue<?string>) : this;
        bindAttr<T1> (
            name : string,
            calculator : (a1 : T1) => string,
            v1 : IValue<T1>,
        ) : this;
        bindAttr<T1, T2> (
            name : string,
            calculator : (a1 : T1, a2 : T2) => string,
            v1 : IValue<T1>, v2 : IValue<T2>,
        ) : this;
        bindAttr<T1, T2, T3> (
            name : string,
            calculator : (a1 : T1, a2 : T2, a3 : T3) => string,
            v1 : IValue<T1>, v2 : IValue<T2>, v3 : IValue<T3>,
        ) : this;
        bindAttr<T1, T2, T3, T4> (
            name : string,
            calculator : (a1 : T1, a2 : T2, a3 : T3, a4 : T4) => string,
            v1 : IValue<T1>, v2 : IValue<T2>, v3 : IValue<T3>,
            v4 : IValue<T4>,
        ) : this;
        bindAttr<T1, T2, T3, T4, T5> (
            name : string,
            calculator : (a1 : T1, a2 : T2, a3 : T3, a4 : T4, a5 : T5) => string,
            v1 : IValue<T1>, v2 : IValue<T2>, v3 : IValue<T3>,
            v4 : IValue<T4>, v5 : IValue<T5>,
        ) : this;
        bindAttr<T1, T2, T3, T4, T5, T6> (
            name : string,
            calculator : (a1 : T1, a2 : T2, a3 : T3, a4 : T4, a5 : T5, a6 : T6) => string,
            v1 : IValue<T1>, v2 : IValue<T2>, v3 : IValue<T3>,
            v4 : IValue<T4>, v5 : IValue<T5>, v6 : IValue<T6>,
        ) : this;
        bindAttr<T1, T2, T3, T4, T5, T6, T7> (
            name : string,
            calculator : (a1 : T1, a2 : T2, a3 : T3, a4 : T4, a5 : T5, a6 : T6, a7 : T7) => string,
            v1 : IValue<T1>, v2 : IValue<T2>, v3 : IValue<T3>,
            v4 : IValue<T4>, v5 : IValue<T5>, v6 : IValue<T6>,
            v7 : IValue<T7>,
        ) : this;
        bindAttr<T1, T2, T3, T4, T5, T6, T7, T8> (
            name : string,
            calculator : (a1 : T1, a2 : T2, a3 : T3, a4 : T4, a5 : T5, a6 : T6, a7 : T7, a8 : T8) => string,
            v1 : IValue<T1>, v2 : IValue<T2>, v3 : IValue<T3>,
            v4 : IValue<T4>, v5 : IValue<T5>, v6 : IValue<T6>,
            v7 : IValue<T7>, v8 : IValue<T8>,
        ) : this;
        bindAttr<T1, T2, T3, T4, T5, T6, T7, T8, T9> (
            name : string,
            calculator : (a1 : T1, a2 : T2, a3 : T3, a4 : T4, a5 : T5, a6 : T6, a7 : T7, a8 : T8, a9 : T9) => string,
            v1 : IValue<T1>, v2 : IValue<T2>, v3 : IValue<T3>,
            v4 : IValue<T4>, v5 : IValue<T5>, v6 : IValue<T6>,
            v7 : IValue<T7>, v8 : IValue<T8>, v9 : IValue<T9>,
        ) : this;
        setAttr (
            name : string,
            value : string
        ) : this;
        addClass (cl : string) : this;
        addClasses (...cl : Array<string>) : this;
        bindClass (
            className : IValue<string>
        ) : this;
        floatingClass (cond : IValue<boolean>, className : string) : this;
        style (name : string, value : IValue<string>) : this;
        bindStyle<T1> (
            name : string,
            calculator : (a1 : T1) => string,
            v1 : IValue<T1>,
        ) : this;
        bindStyle<T1, T2> (
            name : string,
            calculator : (a1 : T1, a2 : T2) => string,
            v1 : IValue<T1>, v2 : IValue<T2>,
        ) : this;
        bindStyle<T1, T2, T3> (
            name : string,
            calculator : (a1 : T1, a2 : T2, a3 : T3) => string,
            v1 : IValue<T1>, v2 : IValue<T2>, v3 : IValue<T3>,
        ) : this;
        bindStyle<T1, T2, T3, T4> (
            name : string,
            calculator : (a1 : T1, a2 : T2, a3 : T3, a4 : T4) => string,
            v1 : IValue<T1>, v2 : IValue<T2>, v3 : IValue<T3>,
            v4 : IValue<T4>,
        ) : this;
        bindStyle<T1, T2, T3, T4, T5> (
            name : string,
            calculator : (a1 : T1, a2 : T2, a3 : T3, a4 : T4, a5 : T5) => string,
            v1 : IValue<T1>, v2 : IValue<T2>, v3 : IValue<T3>,
            v4 : IValue<T4>, v5 : IValue<T5>,
        ) : this;
        bindStyle<T1, T2, T3, T4, T5, T6> (
            name : string,
            calculator : (a1 : T1, a2 : T2, a3 : T3, a4 : T4, a5 : T5, a6 : T6) => string,
            v1 : IValue<T1>, v2 : IValue<T2>, v3 : IValue<T3>,
            v4 : IValue<T4>, v5 : IValue<T5>, v6 : IValue<T6>,
        ) : this;
        bindStyle<T1, T2, T3, T4, T5, T6, T7> (
            name : string,
            calculator : (a1 : T1, a2 : T2, a3 : T3, a4 : T4, a5 : T5, a6 : T6, a7 : T7) => string,
            v1 : IValue<T1>, v2 : IValue<T2>, v3 : IValue<T3>,
            v4 : IValue<T4>, v5 : IValue<T5>, v6 : IValue<T6>,
            v7 : IValue<T7>,
        ) : this;
        bindStyle<T1, T2, T3, T4, T5, T6, T7, T8> (
            name : string,
            calculator : (a1 : T1, a2 : T2, a3 : T3, a4 : T4, a5 : T5, a6 : T6, a7 : T7, a8 : T8) => string,
            v1 : IValue<T1>, v2 : IValue<T2>, v3 : IValue<T3>,
            v4 : IValue<T4>, v5 : IValue<T5>, v6 : IValue<T6>,
            v7 : IValue<T7>, v8 : IValue<T8>,
        ) : this;
        bindStyle<T1, T2, T3, T4, T5, T6, T7, T8, T9> (
            name : string,
            calculator : (a1 : T1, a2 : T2, a3 : T3, a4 : T4, a5 : T5, a6 : T6, a7 : T7, a8 : T8, a9 : T9) => string,
            v1 : IValue<T1>, v2 : IValue<T2>, v3 : IValue<T3>,
            v4 : IValue<T4>, v5 : IValue<T5>, v6 : IValue<T6>,
            v7 : IValue<T7>, v8 : IValue<T8>, v9 : IValue<T9>,
        ) : this;
        setStyle (
            prop : string,
            value : string
        ) : this;
        listen (name : string, handler : (ev : any) => void, options : ?EventListenerOptionsOrUseCapture) : this;
        oncontextmenu (handler : (ev : MouseEvent) => void, options : ?EventListenerOptionsOrUseCapture) : this;
        onmousedown (handler : (ev : MouseEvent) => void, options : ?EventListenerOptionsOrUseCapture) : this;
        onmouseenter (handler : (ev : MouseEvent) => void, options : ?EventListenerOptionsOrUseCapture) : this;
        onmouseleave (handler : (ev : MouseEvent) => void, options : ?EventListenerOptionsOrUseCapture) : this;
        onmousemove (handler : (ev : MouseEvent) => void, options : ?EventListenerOptionsOrUseCapture) : this;
        onmouseout (handler : (ev : MouseEvent) => void, options : ?EventListenerOptionsOrUseCapture) : this;
        onmouseover (handler : (ev : MouseEvent) => void, options : ?EventListenerOptionsOrUseCapture) : this;
        onmouseup (handler : (ev : MouseEvent) => void, options : ?EventListenerOptionsOrUseCapture) : this;
        onclick (handler : (ev : MouseEvent) => void, options : ?EventListenerOptionsOrUseCapture) : this;
        ondblclick (handler : (ev : MouseEvent) => void, options : ?EventListenerOptionsOrUseCapture) : this;
        onblur (handler : (ev : FocusEvent) => void, options : ?EventListenerOptionsOrUseCapture) : this;
        onfocus (handler : (ev : FocusEvent) => void, options : ?EventListenerOptionsOrUseCapture) : this;
        onfocusin (handler : (ev : FocusEvent) => void, options : ?EventListenerOptionsOrUseCapture) : this;
        onfocusout (handler : (ev : FocusEvent) => void, options : ?EventListenerOptionsOrUseCapture) : this;
        onkeydown (handler : (ev : KeyboardEvent) => void, options : ?EventListenerOptionsOrUseCapture) : this;
        onkeyup (handler : (ev : KeyboardEvent) => void, options : ?EventListenerOptionsOrUseCapture) : this;
        onkeypress (handler : (ev : KeyboardEvent) => void, options : ?EventListenerOptionsOrUseCapture) : this;
        ontouchstart (handler : (ev : TouchEvent) => void, options : ?EventListenerOptionsOrUseCapture) : this;
        ontouchmove (handler : (ev : TouchEvent) => void, options : ?EventListenerOptionsOrUseCapture) : this;
        ontouchend (handler : (ev : TouchEvent) => void, options : ?EventListenerOptionsOrUseCapture) : this;
        ontouchcancel (handler : (ev : TouchEvent) => void, options : ?EventListenerOptionsOrUseCapture) : this;
        onwheel (handler : (ev : WheelEvent) => void, options : ?EventListenerOptionsOrUseCapture) : this;
        onabort (handler : (ev : ProgressEvent) => void, options : ?EventListenerOptionsOrUseCapture) : this;
        onerror (handler : (ev : ProgressEvent) => void, options : ?EventListenerOptionsOrUseCapture) : this;
        onload (handler : (ev : ProgressEvent) => void, options : ?EventListenerOptionsOrUseCapture) : this;
        onloadend (handler : (ev : ProgressEvent) => void, options : ?EventListenerOptionsOrUseCapture) : this;
        onloadstart (handler : (ev : ProgressEvent) => void, options : ?EventListenerOptionsOrUseCapture) : this;
        onprogress (handler : (ev : ProgressEvent) => void, options : ?EventListenerOptionsOrUseCapture) : this;
        ontimeout (handler : (ev : ProgressEvent) => void, options : ?EventListenerOptionsOrUseCapture) : this;
        ondrag (handler : (ev : DragEvent) => void, options : ?EventListenerOptionsOrUseCapture) : this;
        ondragend (handler : (ev : DragEvent) => void, options : ?EventListenerOptionsOrUseCapture) : this;
        ondragenter (handler : (ev : DragEvent) => void, options : ?EventListenerOptionsOrUseCapture) : this;
        ondragexit (handler : (ev : DragEvent) => void, options : ?EventListenerOptionsOrUseCapture) : this;
        ondragleave (handler : (ev : DragEvent) => void, options : ?EventListenerOptionsOrUseCapture) : this;
        ondragover (handler : (ev : DragEvent) => void, options : ?EventListenerOptionsOrUseCapture) : this;
        ondragstart (handler : (ev : DragEvent) => void, options : ?EventListenerOptionsOrUseCapture) : this;
        ondrop (handler : (ev : DragEvent) => void, options : ?EventListenerOptionsOrUseCapture) : this;
        onpointerover (handler : (ev : PointerEvent) => void, options : ?EventListenerOptionsOrUseCapture) : this;
        onpointerenter (handler : (ev : PointerEvent) => void, options : ?EventListenerOptionsOrUseCapture) : this;
        onpointerdown (handler : (ev : PointerEvent) => void, options : ?EventListenerOptionsOrUseCapture) : this;
        onpointermove (handler : (ev : PointerEvent) => void, options : ?EventListenerOptionsOrUseCapture) : this;
        onpointerup (handler : (ev : PointerEvent) => void, options : ?EventListenerOptionsOrUseCapture) : this;
        onpointercancel (handler : (ev : PointerEvent) => void, options : ?EventListenerOptionsOrUseCapture) : this;
        onpointerout (handler : (ev : PointerEvent) => void, options : ?EventListenerOptionsOrUseCapture) : this;
        onpointerleave (handler : (ev : PointerEvent) => void, options : ?EventListenerOptionsOrUseCapture) : this;
        ongotpointercapture (handler : (ev : PointerEvent) => void, options : ?EventListenerOptionsOrUseCapture) : this;
        onlostpointercapture (handler : (ev : PointerEvent) => void, options : ?EventListenerOptionsOrUseCapture) : this;
        onanimationstart (handler : (ev : AnimationEvent) => void, options : ?EventListenerOptionsOrUseCapture) : this;
        onanimationend (handler : (ev : AnimationEvent) => void, options : ?EventListenerOptionsOrUseCapture) : this;
        onanimationiteraton (handler : (ev : AnimationEvent) => void, options : ?EventListenerOptionsOrUseCapture) : this;
        onclipboardchange (handler : (ev : ClipboardEvent) => void, options : ?EventListenerOptionsOrUseCapture) : this;
        oncut (handler : (ev : ClipboardEvent) => void, options : ?EventListenerOptionsOrUseCapture) : this;
        oncopy (handler : (ev : ClipboardEvent) => void, options : ?EventListenerOptionsOrUseCapture) : this;
        onpaste (handler : (ev : ClipboardEvent) => void, options : ?EventListenerOptionsOrUseCapture) : this;
        $insertAdjacent (node : Node) : void;
        bindShow (cond : IValue<boolean>) : this;
        html (value : IValue<string>) : void;
    }
    declare export class Tag extends INode {

        constructor () : void;

        preinit (app : AppNode, parent : Fragment, tagName : ?string) : void;
        $appendNode(node: Node): void;
        bindMount(cond: IValue<boolean>): this;
    }
    declare export class Extension extends INode {
        preinit (app : AppNode, parent : Fragment) : void;

        constructor ($ : ?INodePrivate) : void;
    }
    declare export class Component extends Extension {
        constructor () : void;

        mounted () : void;
    }
    declare export class SwitchedNodePrivate extends INodePrivate {
        index : number;
        extension : ?Extension;
        cases : { cond : IValue<boolean>, cb : (node : Fragment) => void }[];
        sync : () => void;

        constructor () : void;
    }
    declare class SwitchedNode extends Extension {
        constructor ($ : ?SwitchedNodePrivate) : void;
        setCases (cases : Array<{ cond : IValue<boolean>, cb : (node : Fragment) => void }>) : void;
        createChild (cb : (node : Fragment) => void) : void;
        ready () : void;
    }
    declare export class DebugPrivate extends FragmentPrivate {
        node : Comment;

        constructor () : void;

        preinitComment (app : AppNode, parent: Fragment, text : IValue<string>) : void;
    }
    declare export class DebugNode extends Fragment {

        constructor () : void;

        preinit (app : AppNode, parent : Fragment, text : ?IValue<string>) : void;
    }
    declare export class Watch<T> extends Fragment {
        slot : Slot<Fragment, T>;
        model : IValue<T>;

        constructor () : void;

        createWatchers () : void;
    }
    declare export class Expression<
        T, T1 = void, T2 = void, T3 = void, T4 = void, T5 = void, T6 = void, T7 = void, T8 = void, T9 = void
        > extends IValue<T> {
        values : [
            IValue<T1>,
            IValue<T2>,
            IValue<T3>,
            IValue<T4>,
            IValue<T5>,
            IValue<T6>,
            IValue<T7>,
            IValue<T8>,
            IValue<T9>
        ];
        valuesCache : [T1, T2, T3, T4, T5, T6, T7, T8, T9];
        func : (i ? : number) => void;
        linkedFunc : Array<() => void>;
        sync : Reference<T>;

        constructor (
            func : (a1 : T1) => T,
            link : boolean,
            v1: IValue<T1>,
        ) : void;
        constructor (
            func : (a1 : T1, a2 : T2) => T,
            link : boolean,
            v1: IValue<T1>,
            v2: IValue<T2>,
        ) : void;
        constructor (
            func : (a1 : T1, a2 : T2, a3 : T3) => T,
            link : boolean,
            v1: IValue<T1>,
            v2: IValue<T2>,
            v3: IValue<T3>,
        ) : void;
        constructor (
            func : (a1 : T1, a2 : T2, a3 : T3, a4 : T4) => T,
            link : boolean,
            v1: IValue<T1>,
            v2: IValue<T2>,
            v3: IValue<T3>,
            v4: IValue<T4>,
        ) : void;
        constructor (
            func : (a1 : T1, a2 : T2, a3 : T3, a4 : T4, a5 : T5) => T,
            link : boolean,
            v1: IValue<T1>,
            v2: IValue<T2>,
            v3: IValue<T3>,
            v4: IValue<T4>,
            v5: IValue<T5>,
        ) : void;
        constructor (
            func : (a1 : T1, a2 : T2, a3 : T3, a4 : T4, a5 : T5, a6 : T6) => T,
            link : boolean,
            v1: IValue<T1>,
            v2: IValue<T2>,
            v3: IValue<T3>,
            v4: IValue<T4>,
            v5: IValue<T5>,
            v6: IValue<T6>,
        ) : void;
        constructor (
            func : (a1 : T1, a2 : T2, a3 : T3, a4 : T4, a5 : T5, a6 : T6, a7 : T7) => T,
            link : boolean,
            v1: IValue<T1>,
            v2: IValue<T2>,
            v3: IValue<T3>,
            v4: IValue<T4>,
            v5: IValue<T5>,
            v6: IValue<T6>,
            v7: IValue<T7>,
        ) : void;
        constructor (
            func : (a1 : T1, a2 : T2, a3 : T3, a4 : T4, a5 : T5, a6 : T6, a7 : T7, a8 : T8) => T,
            link : boolean,
            v1: IValue<T1>,
            v2: IValue<T2>,
            v3: IValue<T3>,
            v4: IValue<T4>,
            v5: IValue<T5>,
            v6: IValue<T6>,
            v7: IValue<T7>,
            v8: IValue<T8>,
        ) : void;
        constructor (
            func : (a1 : T1, a2 : T2, a3 : T3, a4 : T4, a5 : T5, a6 : T6, a7 : T7, a8 : T8, a9 : T9) => T,
            link : boolean,
            v1: IValue<T1>,
            v2: IValue<T2>,
            v3: IValue<T3>,
            v4: IValue<T4>,
            v5: IValue<T5>,
            v6: IValue<T6>,
            v7: IValue<T7>,
            v8: IValue<T8>,
            v9: IValue<T9>,
        ) : void;

        get $ () : T;
        set $ (value : T) : this;
        on (handler : (value : T) => void) : this;
        off (handler : (value : T) => void) : this;
        enable () : this;
        disable () : this;
    }
    declare export class Reference<T> extends IValue<T> {
        value : T;
        onchange : Set<(value : T) => void>;

        constructor (value : T) : void;

        get $ () : T;
        set $ (value : T) : this;

        enable () : void;
        disable () : void;
        on (handler : (value : T) => void) : void;
        off (handler : (value : T) => void) : void;
    }
    declare export class Mirror<T> extends Reference<T> {
        pointedValue : IValue<T>;
        handler : (value : T) => void;
        forwardOnly : boolean;

        constructor (value : IValue<T>, forwardOnly : boolean) : void;
    }
    declare export class Pointer<T> extends Mirror<T> {

        constructor (value : IValue<T>, forwardOnly : boolean) : void;

        point (value : IValue<T>) : void;
    }
    declare export class BaseViewPrivate<K, T> extends RepeatNodePrivate<K> {
        addHandler : (index : K, value : T) => void;
        removeHandler : (index : K, value : T) => void;

        constructor () : void;
    }
    declare export class BaseView<K, T, Model> extends RepeatNode<K, T> {
        model : Model;

        constructor ($ : ?BaseViewPrivate<K, T>) : void;
    }
    declare export class ArrayView<T> extends BaseView<?T, T, ArrayModel<T>> {
        constructor (model : ArrayModel<T>) : void;
        createChild (id : ?T, item : T, before : ?Fragment) : any;
    }
    declare export class MapView<K, T> extends BaseView<K, T, MapModel<K, T>> {
        constructor (model : MapModel<K, T>) : void;
    }
    declare export class ObjectView<T> extends BaseView<string, T, ObjectModel<T>> {
        constructor (model : ObjectModel<T>) : void;
    }
    declare export class RepeatNodePrivate<IdT> extends INodePrivate {
        nodes : Map<IdT, Fragment>;

        constructor () : void;
    }
    declare export class RepeatNode<IdT, T> extends Fragment {
        slot : Slot<Fragment, T, IdT>;
        freezeUi : boolean;

        constructor ($ : ?RepeatNodePrivate<IdT>) : void;

        createChild (id : IdT, item : T, before : ?Fragment) : any;
        destroyChild (id : IdT, item : T) : void;
    }
    declare export class RepeaterPrivate<IdT> extends RepeatNodePrivate<IdT> {
        updateHandler : (value: number) => void;
        currentCount : number;

        constructor () : void;
    }
    declare export class Repeater extends RepeatNode<number, number> {
        count : IValue<number>;

        constructor ($ : ?RepeaterPrivate<number>) : void;

        changeCount (number : number) : void;
    }
    declare export class SetView<T> extends BaseView<T, T, SetModel<T>> {
        constructor (model : SetModel<T>) : void;
    }
    declare export class AttributeBinding extends Binding<?string> {
        constructor (
            node : INode,
            name : string,
            value : IValue<?string>
        ) : void;
    }
    declare export class Binding<T> extends Destroyable {
        binding : IValue<T>;
        func : (value: T) => void;

        constructor (
            node : INode,
            name : string,
            value : IValue<T>
        ) : void;

        destroy () : void;
    }
    declare export class StaticClassBinding extends Binding<boolean> {
        constructor(node: INode, name: string, value: IValue<boolean>) : void;
    }
    declare export class DynamicalClassBinding extends Binding<string> {
        constructor (node : INode, value : IValue<string>) : void;
    }
    declare export class StyleBinding extends Binding<string> {
        constructor (
            node : INode,
            name : string,
            value : IValue<string>
        ) : void;
    }
}
