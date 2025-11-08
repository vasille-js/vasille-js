import { App, Portal, PortalOptions } from "../node/app.js";
import { Fragment, SwitchedNode, SwitchedNodeCase } from "../node/node.js";
import { Runner } from "../node/runner.js";
import { Watch, WatchOptions } from "../node/watch.js";
import { DevValue, Inspector, Position, provideId, toDevIdOrValue, toDevObject, toDevValue } from "./inspectable.js";
import { DevFragment } from "./node.js";

export class DevWatch<Node, Element, TagOptions extends object, T> extends Watch<Node, Element, TagOptions, T> {
    public constructor(input: WatchOptions<Node, Element, TagOptions, T>, runner: Runner<Node, Element, TagOptions>, usage: Position, inspector: Inspector) {
        super(input, runner);

        const id = provideId();

        inspector.createComponent({
            id: id,
            usage: usage,
            name: "Watch",
            props: toDevObject(input),
        })

        this.runOnDestroy(() => {
            inspector.destroy(id);
        });
    }
}

export class DevApp<Node, Element, TagOptions extends object, T extends object> extends App<
    Node,
    Element,
    TagOptions,
    T
> {
    public constructor(node: Element, runner: Runner<Node, Element, TagOptions>, inspector: Inspector) {
        super(node, runner);

        const id = provideId();

        inspector.createComponent({
            id: id,
            name: "App",
            props: {},
        });

        this.runOnDestroy(() => {
            inspector.destroy(id);
        });
    }
}

export class DevPortal<Node, Element, TagOptions extends object> extends Portal<Node, Element, TagOptions> {
    constructor(input: PortalOptions<Node, Element, TagOptions>, runner: Runner<Node, Element, TagOptions>, inspector: Inspector) {
        super(input, runner);

        const id = provideId();

        inspector.createComponent({
            id: id,
            name: "Portal",
            props: {},
        });

        this.runOnDestroy(() => {
            inspector.destroy(id);
        });
    }
} 

export class DevSwitchedNode<Node, Element, TagOptions extends object> extends SwitchedNode<Node, Element, TagOptions> {
    public readonly id: number;
    public readonly inspector: Inspector;

    public constructor(
        inspector: Inspector,
        runner: Runner<Node, Element, TagOptions>,
        cases: SwitchedNodeCase<Node, Element, TagOptions>[],
        _default?: (node: Fragment<Node, Element, TagOptions>) => void,
        
    ) {
        super(runner, cases, _default);

        const id = provideId();
        const conditions: {[k:number]: number|DevValue} = {};

        cases.forEach((_case, index) => {
            conditions[index] = _case.slot === _default ? toDevValue(true) : toDevIdOrValue(_case.$case);
        })

        this.id = id;
        inspector.createComponent({
            id: id,
            name: "Switch",
            props: conditions,
        });
    }

    public destroy(): void {
        this.inspector.destroy(this.id);
        super.destroy();
    }

    protected newChild(index: number): Fragment<Node, Element, TagOptions> {
        const frag = new DevFragment(this.runner, null, null, "Case", {index}, this.inspector);

        this.inspector.setElementParent({parent: this.id, child: frag.id});

        return frag;
    }
}
