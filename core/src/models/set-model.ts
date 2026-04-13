import { Reactive } from "../core/core.js";
import { Fragment } from "../node/node.js";
import { IRunner } from "../node/runner.js";
import { Listener, removeFragmentFromTree } from "./listener.js";

const enum Ops {
    Clear,
    Add,
    Remove,
}

type Arguments<T> = [Ops.Clear] | [Ops.Remove, T] | [Ops.Add, T];

/**
 * A `Set` based model
 * @class SetModel
 * @extends Set
 */
export class SetModel<T> extends Set<T> {
    public listener: Listener<Arguments<T>>;

    /**
     * Constructs a set model based on a set
     */
    public constructor(set?: T[], ctx?: Reactive) {
        super();
        this.listener = new Listener();

        set?.forEach(item => {
            super.add(item);
        });
        ctx?.bind(this);
    }

    /**
     * Calls `Set.add` and notify abut changes
     * @param value {*} value
     * @return {this} a pointer to this
     */
    public override add(value: T): this {
        this.listener.emit(Ops.Add, value);
        return super.add(value);
    }

    /**
     * Calls `Set.clear` and notify about changes
     */
    public override clear() {
        this.listener.emit(Ops.Clear);
        super.clear();
    }

    /**
     * Calls `Set.delete` and notify about changes
     * @param value {*}
     * @return {boolean} true if a value was deleted, otherwise false
     */
    public override delete(value: T): boolean {
        this.listener.emit(Ops.Remove, value);
        return super.delete(value);
    }

    public destroy(): void {
        this.clear();
    }
}

export class SetView<
    T,
    Node,
    Element,
    TagOptions extends object,
    Runner extends IRunner<Node, Element, TagOptions>,
> extends Fragment<Node, Element, TagOptions, Runner> {
    private map = new Map<T, Fragment<Node, Element, TagOptions, Runner>>();
    private acceptUpdate: ((...args: Arguments<T>) => void) | undefined;

    public constructor(
        runner: Runner,
        private readonly model: SetModel<T>,
        private readonly slot: (ctx: Fragment<Node, Element, TagOptions, Runner>, value: T) => void,
        private readonly frag: (runner: Runner) => Fragment<Node, Element, TagOptions, Runner>,
    ) {
        super(runner);
    }

    public override compose() {
        const view = this;

        function create(value: T) {
            const frag = view.frag(view.runner);

            frag.link(view, view.lastChild, undefined);
            view.slot(frag, value);
            view.map.set(value, frag);
            view.lastChild = frag;
        }
        function acceptUpdate(op: Ops, value?: T) {
            if (op === Ops.Add) {
                const existing = view.map.get(value!);

                if (existing) {
                    removeFragmentFromTree(existing);
                    existing.destroy();
                }
                create(value!);
            } else if (op === Ops.Remove) {
                const item = view.map.get(value!);

                /* istanbul ignore else */
                if (item) {
                    removeFragmentFromTree(item);
                    item.destroy();
                }
            } else {
                view.map.forEach(frag => frag.destroy());
                view.map.clear();
                view.lastChild = undefined;
            }
        }

        this.model.forEach(value => create(value));
        this.model.listener.on(acceptUpdate);
        this.acceptUpdate = acceptUpdate;
    }

    public override unmount(keepStructure: boolean) {
        super.unmount(keepStructure);
        this.map.forEach(item => item.unmount(true));
    }
    public override remount() {
        [...this.map.values()].reverse().forEach(item => item.remount());
    }

    public override destroy(keepNodes?: boolean): void {
        /* istanbul ignore else */
        if (this.acceptUpdate) {
            this.model.listener.off(this.acceptUpdate);
        }
        this.map.forEach(frag => frag.destroy());
        this.map.clear();
        super.destroy(keepNodes);
    }
}
