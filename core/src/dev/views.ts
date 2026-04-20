import { IValue } from "../core/ivalue.js";
import { ArrayView, SinglePassArrayView } from "../models/array-model.js";
import { MapView } from "../models/map-model.js";
import { SetView } from "../models/set-model.js";
import { Fragment } from "../node/node.js";
import { IRunner } from "../node/runner.js";
import { Reference } from "../value/reference.js";
import { inspector, provideId, StaticPosition, toDevObject } from "./inspectable.js";
import { DevArrayModel, DevMapModel, DevSetModel } from "./models.js";
import { DevFragment } from "./node.js";
import { DevReference } from "./state.js";

function createDevFragment<Node, Element, TagOptions extends object>(
    runner: IRunner<Node, Element, TagOptions>,
    deep: number,
    host: { id: number },
): DevFragment<Node, Element, TagOptions> {
    return new DevFragment(runner, deep, null, null, "Fragment", {});
}

export class DevArrayView<Node, Element, TagOptions extends object, T> extends ArrayView<
    T,
    Node,
    Element,
    TagOptions,
    IRunner<Node, Element, TagOptions>
> {
    public readonly id: number;

    public constructor(
        runner: IRunner<Node, Element, TagOptions>,
        model: DevArrayModel<T>,
        deep: number,
        slot: (ctx: Fragment<Node, Element, TagOptions>, value: T, index: IValue<number>) => void,
        usage: StaticPosition,
        indexDeclaration?: StaticPosition,
    ) {
        super(
            runner,
            deep,
            model,
            slot,
            v => (indexDeclaration ? new DevReference(v, this, indexDeclaration) : new Reference(v)),
            runner => createDevFragment(runner, deep + 1, this),
        );
        this.id = provideId();

        inspector.createComponent({
            id: this.id,
            name: "ArrayModelView",
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
    IRunner<Node, Element, TagOptions>
> {
    public readonly id: number;

    public constructor(
        runner: IRunner<Node, Element, TagOptions>,
        deep: number,
        model: IValue<T[]>,
        key: (item: T) => number | string,
        slot: (ctx: Fragment<Node, Element, TagOptions>, value: IValue<T>, index: IValue<number>) => void,
        usage: StaticPosition,
        valueDeclaration: StaticPosition | undefined,
        indexDeclaration: StaticPosition | undefined,
    ) {
        super(
            runner,
            deep,
            model,
            key,
            slot,
            v => (valueDeclaration ? new DevReference(v, this, valueDeclaration) : new Reference(v)),
            v => (indexDeclaration ? new DevReference(v, this, indexDeclaration) : new Reference(v)),
            runner => createDevFragment(runner, deep + 1, this),
        );

        this.id = provideId();

        inspector.createComponent({
            id: this.id,
            name: "ArrayView",
            props: toDevObject({ model, slot }),
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
    IRunner<Node, Element, TagOptions>
> {
    public readonly id: number;

    public constructor(
        runner: IRunner<Node, Element, TagOptions>,
        deep: number,
        model: DevSetModel<T>,
        slot: (ctx: Fragment<Node, Element, TagOptions>, value: T) => void,
        usage: StaticPosition,
    ) {
        super(runner, deep, model, slot, runner => createDevFragment(runner, deep + 1, this));
        this.id = provideId();

        inspector.createComponent({
            id: this.id,
            name: "SetView",
            props: toDevObject({ model, slot }),
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
    IRunner<Node, Element, TagOptions>
> {
    public readonly id: number;

    public constructor(
        runner: IRunner<Node, Element, TagOptions>,
        deep: number,
        model: DevMapModel<K, T>,
        slot: (ctx: Fragment<Node, Element, TagOptions>, value: IValue<T>, key: K) => void,
        usage: StaticPosition,
        valueDeclaration: StaticPosition | undefined,
    ) {
        super(
            runner,
            deep,
            model,
            slot,
            v => (valueDeclaration ? new DevReference(v, this, valueDeclaration) : new Reference(v)),
            runner => createDevFragment(runner, deep + 1, this),
        );
        this.id = provideId();

        inspector.createComponent({
            id: this.id,
            name: "MapView",
            props: toDevObject({ model, slot }),
            usage: usage,
            time: Date.now(),
        });
    }
}
