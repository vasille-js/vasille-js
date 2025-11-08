import { Fragment, Tag } from "../node/node.js";
import { Runner } from "../node/runner.js";
import { DevValue, Inspectable, Inspector, Position, ProtocolTag, provideId, toDevIdOrValue, toDevObject, toDevValue } from "./inspectable.js";
import { DevExpression, DevReference } from "./state.js";

export class DevFragment<Node, Element, TagOptions extends object>
    extends Fragment<Node, Element, TagOptions>
    implements Inspectable
{
    id: number;
    declaration: Position|null;
    inspector: Inspector;

    public constructor(runner: Runner<Node, Element, TagOptions>, declaration: Position|null, usage: Position|null, name: string, props: object, inspector: Inspector) {
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
        this.inspector.addContextState({
            id: this.id,
            name: name,
            stateId: value.id,
        });

        return value;
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

    public constructor(options: TagOptions, runner: Runner<Node, Element, TagOptions>, tagName: string, declaration: Position, inspector: Inspector) {
        super(options, runner, tagName);
        this.declaration = declaration;
        this.inspector = inspector;
        inspector.createTag(this.toProtocolTag(options));
    }

    public destroy(): void {
        this.inspector.destroy(this.id);
        super.destroy();
    }

    public shareContextState<T extends DevReference<unknown>|DevExpression<unknown, unknown[]>>(value: T, name: string): T {
        this.inspector.addContextState({
            id: this.id,
            name: name,
            stateId: value.id,
        });

        return value;
    }

    protected abstract toProtocolTag(options: TagOptions): ProtocolTag;
}
