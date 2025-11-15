import { App, Portal, PortalOptions } from "../node/app.js";
import { Fragment, SwitchedNode, SwitchedNodeCase } from "../node/node.js";
import { IRunner } from "../node/runner.js";
import { Watch, WatchOptions } from "../node/watch.js";
import {
    DevValue,
    Inspector,
    provideId,
    StaticPosition,
    toDevIdOrValue,
    toDevObject,
    toDevValue,
} from "./inspectable.js";
import { DevFragment } from "./node.js";

export class DevWatch<Node, Element, TagOptions extends object, T> extends Watch<Node, Element, TagOptions, T> {
    public constructor(
        input: WatchOptions<Node, Element, TagOptions, T>,
        runner: IRunner<Node, Element, TagOptions>,
        usage: StaticPosition,
        inspector: Inspector | undefined,
    ) {
        super(input, runner);

        const id = provideId();

        inspector?.createComponent({
            id: id,
            usage: usage,
            name: "Watch",
            props: toDevObject(input),
        });

        this.runOnDestroy(() => {
            inspector?.destroy(id);
        });
    }
}

export class DevApp<Node, Element, TagOptions extends object> extends App<Node, Element, TagOptions> {
    public constructor(node: Element, runner: IRunner<Node, Element, TagOptions>, inspector: Inspector) {
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
    public readonly id: number;

    constructor(
        input: PortalOptions<Node, Element, TagOptions>,
        runner: IRunner<Node, Element, TagOptions>,
        inspector: Inspector | undefined,
        declaration: StaticPosition | undefined,
        usage: StaticPosition | undefined,
        name: string | undefined,
    ) {
        super(input, runner);

        if (inspector) {
            const id = (this.id = provideId());

            inspector.createComponent({
                id: id,
                name: name ?? "Portal",
                props: {},
                declaration: declaration,
                usage: usage,
            });

            this.runOnDestroy(() => {
                inspector.destroy(id);
            });
        }
    }
}

export class DevSwitchedNode<Node, Element, TagOptions extends object> extends SwitchedNode<Node, Element, TagOptions> {
    public readonly id: number;
    public readonly inspector: Inspector | undefined;

    public constructor(
        inspector: Inspector | undefined,
        usage: StaticPosition,
        runner: IRunner<Node, Element, TagOptions>,
        cases: SwitchedNodeCase<Node, Element, TagOptions>[],
        _default?: (node: Fragment<Node, Element, TagOptions>) => void,
    ) {
        super(runner, cases, _default);

        const id = provideId();
        const conditions: { [k: number]: number | DevValue } = {};

        cases.forEach((_case, index) => {
            conditions[index] = _case.slot === _default ? toDevValue(true) : toDevIdOrValue(_case.$case);
        });

        this.id = id;
        this.inspector = inspector;
        inspector?.createComponent({
            id: id,
            name: "Switch",
            props: conditions,
            usage: usage,
        });
    }

    public destroy(): void {
        this.inspector?.destroy(this.id);
        super.destroy();
    }

    protected newChild(index: number): Fragment<Node, Element, TagOptions> {
        const frag = new DevFragment(this.runner, null, null, "Case", { index }, this.inspector);

        this.inspector?.setElementParent({ parent: this.id, child: frag.id });

        return frag;
    }
}
