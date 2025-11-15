import { Fragment, Tag } from "../node/node.js";
import {
    IDevRunner,
    InspectableReactive,
    Inspector,
    ProtocolTag,
    provideId,
    StaticPosition,
    toDevObject,
} from "./inspectable.js";
import { DevArrayModel, DevMapModel, DevSetModel } from "./models.js";
import { DevExpression, DevReference } from "./state.js";

export const ModelId = Symbol("model-id");

export function shareStateById<T>(
    id: number | undefined,
    runner: IDevRunner<unknown, unknown, object>,
    name: string,
    value: T,
): T {
    const inspector = runner.inspector;

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
    extends Fragment<Node, Element, TagOptions, IDevRunner<Node, Element, TagOptions>>
    implements InspectableReactive
{
    id: number;
    declaration: StaticPosition | null;
    inspector: Inspector;

    public constructor(
        runner: IDevRunner<Node, Element, TagOptions>,
        declaration: StaticPosition | null,
        usage: StaticPosition | null,
        name: string,
        props: object,
    ) {
        super(runner);
        this.id = provideId();
        this.declaration = declaration;
        this.inspector = runner.inspector;

        runner.inspector.createComponent({
            id: this.id,
            declaration: declaration,
            usage: usage,
            name: name,
            props: toDevObject(props),
        });
    }

    public destroy(): void {
        this.inspector.destroy(this.id);
    }

    protected pushNode(node: Fragment<Node, Element, TagOptions>): void {
        if ("id" in node && typeof node.id == "number") {
            this.inspector.setElementParent({
                parent: this.id,
                child: node.id,
            });
        }
        super.pushNode(node);
    }
}

export abstract class DevTag<Node, Element, TagOptions extends object>
    extends Tag<Node, Element, TagOptions>
    implements InspectableReactive
{
    id: number;
    declaration: StaticPosition;
    inspector: Inspector;

    public constructor(
        options: TagOptions,
        runner: IDevRunner<Node, Element, TagOptions>,
        tagName: string,
        declaration: StaticPosition,
    ) {
        super(options, runner, tagName);
        this.declaration = declaration;
        this.inspector = runner.inspector;
        runner.inspector.createTag(this.toProtocolTag(options));
    }

    public destroy(): void {
        this.inspector.destroy(this.id);
        super.destroy();
    }

    protected abstract toProtocolTag(options: TagOptions): ProtocolTag;
}
