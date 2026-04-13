import { IValue } from "../core/ivalue.js";
import { ArrayView, SinglePassArrayView } from "../models/array-model.js";
import { MapView } from "../models/map-model.js";
import { SetView } from "../models/set-model.js";
import { Fragment } from "../node/node.js";
import { Reference } from "../value/reference.js";
import { IDevRunner, provideId, StaticPosition, toDevObject } from "./inspectable.js";
import { DevArrayModel, DevMapModel, DevSetModel } from "./models.js";
import { DevFragment } from "./node.js";
import { DevReference } from "./state.js";

function createDevFragment<Node, Element, TagOptions extends object>(
    runner: IDevRunner<Node, Element, TagOptions>,
    host: { id: number },
): DevFragment<Node, Element, TagOptions> {
    const frag = new DevFragment(runner, null, null, "Fragment", {});
    runner.inspector.setElementParent({ parent: host.id, child: frag.id });
    return frag;
}

export class DevArrayView<Node, Element, TagOptions extends object, T> extends ArrayView<
    T,
    Node,
    Element,
    TagOptions,
    IDevRunner<Node, Element, TagOptions>
> {
    public readonly id: number;

    public constructor(
        runner: IDevRunner<Node, Element, TagOptions>,
        model: DevArrayModel<T>,
        slot: (ctx: Fragment<Node, Element, TagOptions>, value: T, index: IValue<number>) => void,
        usage: StaticPosition,
        indexDeclaration?: StaticPosition,
    ) {
        super(
            runner,
            model,
            slot,
            v => (indexDeclaration ? new DevReference(v, indexDeclaration, runner.inspector) : new Reference(v)),
            runner => createDevFragment(runner, this),
        );
        this.id = provideId();

        runner.inspector.createComponent({
            id: this.id,
            name: "ArrayView",
            props: toDevObject({ model }),
            usage: usage,
            time: Date.now(),
        });
    }
}

export class DevSinglePassArrayView<Node, Element, TagOptions extends object, T> extends SinglePassArrayView<
    T,
    Node,
    Element,
    TagOptions,
    IDevRunner<Node, Element, TagOptions>
> {
    public readonly id: number;

    public constructor(
        runner: IDevRunner<Node, Element, TagOptions>,
        model: IValue<T[]>,
        key: (item: T) => number | string,
        slot: (ctx: Fragment<Node, Element, TagOptions>, value: IValue<T>, index: IValue<number>) => void,
        usage: StaticPosition,
        valueDeclaration: StaticPosition,
        indexDeclaration: StaticPosition,
    ) {
        super(
            runner,
            model,
            key,
            slot,
            v => new DevReference(v, valueDeclaration, runner.inspector),
            v => new DevReference(v, indexDeclaration, runner.inspector),
            runner => createDevFragment(runner, this),
        );

        this.id = provideId();

        runner.inspector.createComponent({
            id: this.id,
            name: "SinglePassArrayView",
            props: toDevObject({ model }),
            usage: usage,
            time: Date.now(),
        });
    }
}

export class DevMultiPassArrayView<Node, Element, TagOptions extends object, T> extends SinglePassArrayView<
    T,
    Node,
    Element,
    TagOptions,
    IDevRunner<Node, Element, TagOptions>
> {
    public readonly id: number;

    public constructor(
        runner: IDevRunner<Node, Element, TagOptions>,
        model: IValue<T[]>,
        key: (item: T) => number | string,
        slot: (ctx: Fragment<Node, Element, TagOptions>, value: IValue<T>, index: IValue<number>) => void,
        usage: StaticPosition,
        valueDeclaration: StaticPosition,
        indexDeclaration: StaticPosition,
    ) {
        super(
            runner,
            model,
            key,
            slot,
            v => new DevReference(v, valueDeclaration, runner.inspector),
            v => new DevReference(v, indexDeclaration, runner.inspector),
            runner => createDevFragment(runner, this),
        );

        this.id = provideId();

        runner.inspector.createComponent({
            id: this.id,
            name: "MultiPassArrayView",
            props: toDevObject({ model }),
            usage: usage,
            time: Date.now(),
        });
    }
}

export class DevSetView<Node, Element, TagOptions extends object, T> extends SetView<
    T,
    Node,
    Element,
    TagOptions,
    IDevRunner<Node, Element, TagOptions>
> {
    public readonly id: number;

    public constructor(
        runner: IDevRunner<Node, Element, TagOptions>,
        model: DevSetModel<T>,
        slot: (ctx: Fragment<Node, Element, TagOptions>, value: T) => void,
        usage: StaticPosition,
    ) {
        super(runner, model, slot, runner => createDevFragment(runner, this));
        this.id = provideId();

        runner.inspector.createComponent({
            id: this.id,
            name: "SetView",
            props: toDevObject({ model }),
            usage: usage,
            time: Date.now(),
        });
    }
}

export class DevMapView<Node, Element, TagOptions extends object, K, T> extends MapView<
    K,
    T,
    Node,
    Element,
    TagOptions,
    IDevRunner<Node, Element, TagOptions>
> {
    public readonly id: number;

    public constructor(
        runner: IDevRunner<Node, Element, TagOptions>,
        model: DevMapModel<K, T>,
        slot: (ctx: Fragment<Node, Element, TagOptions>, value: IValue<T>, key: K) => void,
        usage: StaticPosition,
        valueDeclaration: StaticPosition | undefined,
    ) {
        super(
            runner,
            model,
            slot,
            v => (valueDeclaration ? new DevReference(v, valueDeclaration, runner.inspector) : new Reference(v)),
            runner => createDevFragment(runner, this),
        );
        this.id = provideId();

        runner.inspector.createComponent({
            id: this.id,
            name: "MapView",
            props: toDevObject({ model }),
            usage: usage,
            time: Date.now(),
        });
    }
}
