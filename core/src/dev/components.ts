import { App, Portal, PortalOptions } from "../node/app.js";
import { Fragment, SwitchedNode, SwitchedNodeCase } from "../node/node.js";
import { IRunner } from "../node/runner.js";
import { Watch, WatchOptions } from "../node/watch.js";
import {
    DevValue,
    inspector,
    provideId,
    StaticPosition,
    toDevIdOrValue,
    toDevObject,
    toDevValue,
} from "./inspectable.js";
import { DevFragment } from "./node.js";

export class DevWatch<Node, Element, TagOptions extends object, T> extends Watch<Node, Element, TagOptions, T> {
    public constructor(
        input: WatchOptions<Node, Element, TagOptions, IRunner<Node, Element, TagOptions>, T>,
        runner: IRunner<Node, Element, TagOptions>,
        usage: StaticPosition,
    ) {
        super(input, runner, 1);
        this.rDeep = 0;

        const id = provideId();

        inspector.createComponent({
            id: id,
            usage: usage,
            name: "Watch",
            props: toDevObject(input),
            time: Date.now(),
        });

        this.runOnDestroy(() => {
            inspector.destroy({ id, time: Date.now() });
        });
    }
}

export class DevApp<Node, Element, TagOptions extends object> extends App<Node, Element, TagOptions> {
    public constructor(node: Element, runner: IRunner<Node, Element, TagOptions>) {
        super(node, runner);

        const id = provideId();

        inspector.createComponent({
            id: id,
            name: "App",
            props: {},
            time: Date.now(),
        });

        this.runOnDestroy(() => {
            inspector.destroy({ id, time: Date.now() });
        });
    }
}

export class DevPortal<
    Node,
    Element,
    TagOptions extends object,
    Runner extends IRunner<Node, Element, TagOptions>,
> extends Portal<Node, Element, TagOptions, Runner> {
    public readonly id: number;

    constructor(
        input: PortalOptions<Node, Element, TagOptions, Runner>,
        runner: Runner,
        declaration: StaticPosition | undefined,
        usage: StaticPosition | undefined,
        name: string | undefined,
    ) {
        super(input, runner, 1);
        this.rDeep = 0;

        const id = (this.id = provideId());

        inspector.createComponent({
            id: id,
            name: name ?? "Portal",
            props: {},
            declaration: declaration,
            usage: usage,
            time: Date.now(),
        });

        this.runOnDestroy(() => {
            inspector.destroy({ id, time: Date.now() });
        });
    }
}

export class DevSwitchedNode<Node, Element, TagOptions extends object> extends SwitchedNode<
    Node,
    Element,
    TagOptions,
    IRunner<Node, Element, TagOptions>
> {
    public readonly id: number;

    public constructor(
        usage: StaticPosition,
        runner: IRunner<Node, Element, TagOptions>,
        cases: SwitchedNodeCase<Node, Element, TagOptions, IRunner<Node, Element, TagOptions>>[],
        _default?: (node: Fragment<Node, Element, TagOptions>) => void,
    ) {
        super(runner, 1, cases, _default);
        this.rDeep = 0;

        const id = provideId();
        const conditions: { [k: number]: number | DevValue } = {};

        cases.forEach((_case, index) => {
            conditions[index] = _case.slot === _default ? toDevValue(true) : toDevIdOrValue(_case.$case);
        });

        this.id = id;
        inspector.createComponent({
            id: id,
            name: "Switch",
            props: conditions,
            usage: usage,
            time: Date.now(),
        });
    }

    public override destroy(deep: number, keepNodes?: boolean): void {
        inspector.destroy({ id: this.id, time: Date.now() });
        super.destroy(deep, keepNodes);
    }

    protected override newChild(
        index: number,
    ): Fragment<Node, Element, TagOptions, IRunner<Node, Element, TagOptions>> {
        return new DevFragment(this.runner, this.sDeep + 1, null, null, "Case", { index });
    }
}
