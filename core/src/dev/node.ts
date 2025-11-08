import { Fragment, Tag } from "../node/node.js";
import { IRunner } from "../node/runner.js";
import { DevValue, Inspectable, Inspector, Position, ProtocolTag, provideId, toDevIdOrValue, toDevObject, toDevValue } from "./inspectable.js";
import { DevArrayModel, DevMapModel, DevSetModel } from "./models.js";
import { DevExpression, DevReference } from "./state.js";

export const ModelId = Symbol("model-id");

function shareState<T>(target: DevFragment<unknown, unknown, object>|DevTag<unknown, unknown, object>, name: string, value: T): T {
    if (value instanceof DevReference || value instanceof DevExpression || value instanceof DevArrayModel || value instanceof DevSetModel || value instanceof DevMapModel) {
        target.inspector.addContextState({
            id: target.id,
            name: name,
            stateId: value.id,
        })
    }
    else if (value && typeof value == "object" && ModelId in value) {
        target.inspector.addContextState({
            id: target.id,
            name: name,
            stateId: value[ModelId] as number,
        })
    }

    return value;
}

export class DevFragment<Node, Element, TagOptions extends object>
    extends Fragment<Node, Element, TagOptions>
    implements Inspectable
{
    id: number;
    declaration: Position|null;
    inspector: Inspector;

    public constructor(runner: IRunner<Node, Element, TagOptions>, declaration: Position|null, usage: Position|null, name: string, props: object, inspector: Inspector) {
        super(runner);
        this.id = provideId();
        this.declaration = declaration;
        this.inspector = inspector;

        inspector.createComponent({
            id: this.id,
            declaration: declaration,
            usage: usage,
            name: name,
            props: toDevObject(props),
        });
    }

    public shareContextState<T extends DevReference<unknown>|DevExpression<unknown, unknown[]>>(value: T, name: string): T {
        return shareState(this, name, value);
    }

    public destroy(): void {
        this.inspector.destroy(this.id);
    }

    protected pushNode(node: DevFragment<Node, Element, TagOptions>): void {
        this.inspector.setElementParent({
            parent: this.id,
            child: node.id,
        })
        super.pushNode(node);
    }
}

export abstract class DevTag<Node, Element, TagOptions extends object> extends Tag<Node, Element, TagOptions> implements Inspectable {
    id: number;
    declaration: Position;
    inspector: Inspector;

    public constructor(options: TagOptions, runner: IRunner<Node, Element, TagOptions>, tagName: string, declaration: Position, inspector: Inspector) {
        super(options, runner, tagName);
        this.declaration = declaration;
        this.inspector = inspector;
        inspector.createTag(this.toProtocolTag(options));
    }

    public destroy(): void {
        this.inspector.destroy(this.id);
        super.destroy();
    }

    public shareContextState<T>(value: T, name: string): T {
        return shareState(this, name, value);
    }

    protected abstract toProtocolTag(options: TagOptions): ProtocolTag;
}
