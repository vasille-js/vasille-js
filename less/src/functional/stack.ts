import {
    AcceptedTagsMap,
    App,
    ArrayModel, ArrayView,
    Component,
    current,
    Extension,
    Fragment,
    FragmentOptions,
    IValue, ListenableModel, MapModel, MapView, ObjectModel, ObjectView, SetModel, SetView,
    TagOptions,
    TagOptionsWithSlot,
    userError,
    Watch,
    Reactive,
    stack,
    unstack, Portal,
} from "vasille";
import {AppOptions} from "./options";



export function reactive<In = void, Out = {}>(renderer : (opts: In) => Out)
    : (opts: In) => Out & {destructor: () => void} {
    return (opts : In) => {
        const obj = new Reactive({});
        stack(obj);
        const res = renderer(opts);
        unstack();
        return {
            ...res,
            destructor: () => obj.$destroy(),
        };
    }
}

export function app<In extends AppOptions<any>>(renderer: (opts : In) => Required<In>["return"])
    : (node: Element, opts : In) => Required<In>["return"] {
    return (node, opts) => {
        return new App(node, opts).runFunctional(renderer, opts);
    }
}

export function component<In extends TagOptions<any>>
    (renderer: (opts : In) => In["return"])
    : (opts : In, callback ?: In['slot']) => Required<In>["return"] {
    return (opts, callback ?: In['slot']) => {
        const component = new Component(opts);
        if (!(current instanceof Fragment)) throw userError('missing parent node', 'out-of-context');

        let ret : In["return"];

        if (callback) opts.slot = callback;
        current.create(component, node => {
            ret = node.runFunctional(renderer, opts);
        });

        return ret;
    }
}

export function fragment<In extends FragmentOptions>
    (renderer: (opts : In) => In["return"]) : (opts : In, callback ?: In['slot']) => Required<In>["return"] {
    return (opts, callback ?: In['slot']) => {
        const frag = new Fragment(opts);
        if (!(current instanceof Fragment)) throw userError('missing parent node', 'out-of-context');

        if (callback) opts.slot = callback;
        current.create(frag);

        return frag.runFunctional(renderer, opts);
    }
}

export function extension<In extends TagOptions<any>>
(renderer: (opts : In) => In["return"]) : (opts : In, callback ?: In['slot']) => In["return"] {
    return (opts, callback ?: Required<In>['slot']) => {
        const ext = new Extension(opts);
        if (!(current instanceof Fragment)) throw userError('missing parent node', 'out-of-context');

        if (callback) opts.slot = callback;
        current.create(ext);

        return ext.runFunctional(renderer, opts);
    }
}

export function tag<K extends keyof AcceptedTagsMap>(
    name : K,
    opts : TagOptionsWithSlot<K>,
    callback ?: () => void
    // @ts-expect-error
) : { node : (HTMLElementTagNameMap & SVGElementTagNameMap)[K] } {
    if (!(current instanceof Fragment)) throw userError('missing parent node', 'out-of-context');

    return {
        node : current.tag(name, opts, (node: Fragment) => {
            callback && node.runFunctional(callback);
        })
    };
}

type ExtractParams<T> = T extends ((node : Fragment, ...args: infer P) => any) ? P : never

export function create<T extends Fragment>(
    node : T,
    callback ?: (...args: ExtractParams<T['input']['slot']>) => void
) : T['input']['return'] {
    if (!(current instanceof Fragment)) throw userError('missing current node', 'out-of-context');

    return current.create(node, (node : Fragment, ...args : ExtractParams<T['input']['slot']>) => {
        callback && node.runFunctional(callback, ...args);
    });
}



export const vx = {
    if(condition: IValue<boolean>, callback: () => void) {
        if (current instanceof Fragment) {
            current.if(condition, node => node.runFunctional(callback));
        }
        else {
            throw userError("wrong use of `v.if` function", "logic-error");
        }
    },
    else(callback: () => void) {
        if (current instanceof Fragment) {
            current.else(node => node.runFunctional(callback));
        }
        else {
            throw userError("wrong use of `v.else` function", "logic-error");
        }
    },
    elif(condition: IValue<boolean>, callback: () => void) {
        if (current instanceof Fragment) {
            current.elif(condition, node => node.runFunctional(callback));
        }
        else {
            throw userError("wrong use of `v.elif` function", "logic-error");
        }
    },
    for<T, K>(model : ListenableModel<K, T>, callback : (value : T, index : K) => void) {

        if (model instanceof ArrayModel) {
            // for arrays T & K are the same type
            create(new ArrayView<T>({ model }), callback as any as (value : T, index : T) => void);
        }
        else if (model instanceof MapModel) {
            create(new MapView<K, T>({ model }), callback);
        }
        else if (model instanceof SetModel) {
            // for sets T & K are the same type
            create(new SetView<T>({ model }), callback as any as (value : T, index : T) => void);
        }
        else if (model instanceof ObjectModel) {
            // for objects K is always string
            create(new ObjectView<T>({ model }), callback as any as (value : T, index : string) => void);
        }
        else {
            throw userError("wrong use of `v.for` function", 'wrong-model');
        }
    },
    watch<T>(model: IValue<T>, slot: (value : T) => void) {
        const opts = {model};
        create(new Watch<T>(opts), slot);
    },
    portal(node: HTMLElement, slot: () => void) {
        create(new Portal({node}), slot);
    },
    async(callback: () => void) {
        const node = current;
        window.setTimeout(() => {
            node.runFunctional(callback);
        }, 0);
    }
}
