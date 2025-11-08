import { Fragment } from "../node/node.js";
import { Runner } from "../node/runner.js";
import { ArrayView } from "../views/array-view.js";
import { BaseViewOptions } from "../views/base-view.js";
import { MapView } from "../views/map-view.js";
import { SetView } from "../views/set-view.js";
import { Inspector, Position, provideId, toDevObject } from "./inspectable.js";
import { DevArrayModel, DevMapModel, DevSetModel } from "./models.js";
import { DevFragment } from "./node.js";

export class DevArrayView<Node, Element, TagOptions extends object, T> extends ArrayView<Node, Element, TagOptions, T> {
    public readonly id: number;
    public readonly inspector: Inspector;

    public constructor(
        input: BaseViewOptions<Node, Element, TagOptions, T, T, DevArrayModel<T>>,
        runner: Runner<Node, Element, TagOptions>,
        inspector: Inspector,
        usage: Position
    ) {
        super(input, runner);
        this.id = provideId();
        this.inspector = inspector;
        
        inspector.createComponent({
            id: this.id,
            name: "ArrayView",
            props: toDevObject(input),
            usage: usage,
        })
    }

    protected newChild(id: T, item: T): Fragment<Node, Element, TagOptions> {
        const frag =new DevFragment(this.runner, null, null, "ArrayViewItem", {item}, this.inspector);
        this.inspector.setElementParent({parent: this.id, child: frag.id});
        return frag;
    }
}

export class DevSetView<Node, Element, TagOptions extends object, T> extends SetView<Node, Element, TagOptions, T> {
    public readonly id: number;
    public readonly inspector: Inspector;

    public constructor(
        input: BaseViewOptions<Node, Element, TagOptions, T, T, DevSetModel<T>>,
        runner: Runner<Node, Element, TagOptions>,
        inspector: Inspector,
        usage: Position
    ) {
        super(input, runner);
        this.id = provideId();
        this.inspector = inspector;
        
        inspector.createComponent({
            id: this.id,
            name: "SetView",
            props: toDevObject(input),
            usage: usage,
        })
    }

    protected newChild(_id: T, item: T): Fragment<Node, Element, TagOptions> {
        const frag =new DevFragment(this.runner, null, null, "SetViewItem", {item}, this.inspector);
        this.inspector.setElementParent({parent: this.id, child: frag.id});
        return frag;
    }
}

export class DevMapView<Node, Element, TagOptions extends object, K, T> extends MapView<Node, Element, TagOptions, K, T> {
    public readonly id: number;
    public readonly inspector: Inspector;

public constructor(
        input: BaseViewOptions<Node, Element, TagOptions, K, T, DevMapModel<K, T>>,
        runner: Runner<Node, Element, TagOptions>,
        inspector: Inspector,
        usage: Position
    ) {
        super(input, runner);
        this.id = provideId();
        this.inspector = inspector;
        
        inspector.createComponent({
            id: this.id,
            name: "MapView",
            props: toDevObject(input),
            usage: usage,
        })
    }

    protected newChild(key: K, value: T): Fragment<Node, Element, TagOptions> {
        const frag =new DevFragment(this.runner, null, null, "MapViewItem", {key, value}, this.inspector);
        this.inspector.setElementParent({parent: this.id, child: frag.id});
        return frag;
    }
}
