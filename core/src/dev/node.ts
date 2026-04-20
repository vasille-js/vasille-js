import { Fragment } from "../node/node.js";
import { IRunner } from "../node/runner.js";
import { InspectableReactive, inspector, provideId, StaticPosition, toDevObject } from "./inspectable.js";
import { DevArrayModel, DevMapModel, DevSetModel } from "./models.js";
import { DevExpression, DevReference } from "./state.js";

export const ModelId = Symbol("model-id");

export function shareStateById<T>(id: number | undefined, name: string, value: T): T {
    if (
        value instanceof DevReference ||
        value instanceof DevExpression ||
        value instanceof DevArrayModel ||
        value instanceof DevSetModel ||
        value instanceof DevMapModel
    ) {
        inspector.addContextState({
            id: id ?? 0,
            name: name,
            stateId: value.id,
        });
    } else if (value && typeof value == "object" && ModelId in value) {
        inspector.addContextState({
            id: id ?? 0,
            name: name,
            stateId: value[ModelId] as number,
        });
    }

    return value;
}

export class DevFragment<Node, Element, TagOptions extends object>
    extends Fragment<Node, Element, TagOptions, IRunner<Node, Element, TagOptions>>
    implements InspectableReactive
{
    id: number;
    declaration: StaticPosition | null;

    public constructor(
        runner: IRunner<Node, Element, TagOptions>,
        deep: number,
        declaration: StaticPosition | null,
        usage: StaticPosition | null,
        name: string,
        props: object,
    ) {
        super(runner, deep);
        this.id = provideId();
        this.declaration = declaration;

        inspector.createComponent({
            id: this.id,
            declaration: declaration,
            usage: usage,
            name: name,
            props: toDevObject(props),
            time: Date.now(),
        });
    }

    public override link(
        parent: Fragment<Node, Element, TagOptions>,
        prev: Fragment<Node, Element, TagOptions> | undefined,
        next: Fragment<Node, Element, TagOptions> | undefined,
    ) {
        super.link(parent, prev, next);
        this.refreshDeep(0);
        if (parent instanceof DevFragment) {
            inspector.setElementParent({ parent: parent.id, child: this.id });
        }
    }

    public override destroy(deep: number, keepNodes?: boolean): void {
        inspector.destroy({ id: this.id, time: Date.now() });
        super.destroy(deep, keepNodes);
    }

    protected override push(node: Fragment<Node, Element, TagOptions>): void {
        if ("id" in node && typeof node.id == "number") {
            inspector.setElementParent({
                parent: this.id,
                child: node.id,
            });
        }
        super.push(node);
    }
}
