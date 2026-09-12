import { CssStyleInjector } from "vasille-css";
import { IValue } from "../core/ivalue.js";
import { TextProps } from "../node/node.js";
import { IRunner } from "../node/runner.js";
import { Runner, Tag, TagOptions, TextNode } from "../runner/web/runner.js";
import {
    getPosition,
    inspector,
    provideId,
    StaticPosition,
    toDevId,
    toDevIdOrValue,
    toDevObject,
    toDevValue,
} from "./inspectable.js";
import { DevExpression, DevReference } from "./state.js";

export interface DevTagOptions extends TagOptions {
    usage?: StaticPosition;
}

export class PositionedText {
    public text: unknown;
    public position: StaticPosition;

    public constructor(text: unknown, position: StaticPosition) {
        this.text = text;
        this.position = position;
    }
}

export function positionedText(text: unknown, position: StaticPosition) {
    return new PositionedText(text, position);
}

export class DevTextNode extends TextNode<DevTagOptions, DevRunner> {
    public readonly id: number;

    public constructor(input: TextProps, runner: DevRunner, deep: number, usage: StaticPosition) {
        super(input, runner, deep);
        this.id = provideId();

        inspector.createNode({
            id: this.id,
            time: Date.now(),
            text: toDevIdOrValue(input.text),
            position: usage,
        });
    }

    public override destroy(deep: number, keepNodes?: boolean): void {
        inspector.destroy({ id: this.id, time: Date.now() });
        super.destroy(deep, keepNodes);
    }

    public override compose(): void {
        super.compose();
        Object.defineProperty(this.node, "vasille", { value: this.id, configurable: false, enumerable: false });
    }
}

export function remapObject<Before, After>(
    obj: { [k: string]: Before } | undefined,
    transform: (v: Before) => After,
): { [k: string]: After } {
    const r: { [k: string]: After } = {};

    for (const key in obj) {
        r[key] = transform(obj[key]!);
    }

    return r;
}

export class DevTag extends Tag<DevTagOptions, DevRunner> {
    public readonly id: number;

    public constructor(
        options: DevTagOptions,
        runner: DevRunner,
        deep: number,
        tagName: string,
        usage: StaticPosition | undefined,
    ) {
        super(options, runner, tagName, deep);

        this.id = provideId();

        inspector.createTag({
            id: this.id,
            time: Date.now(),
            tagName: tagName,
            usage: usage,
            callback: options.k && toDevIdOrValue(options.k),
            attr: options.a && toDevObject(options.a),
            class:
                options.c &&
                options.c.map(item => {
                    if (typeof item === "string") {
                        return item;
                    }
                    if (item instanceof DevReference || item instanceof DevExpression) {
                        return item.id;
                    }
                    if (item instanceof IValue) {
                        return JSON.stringify(item.V);
                    }
                    if (item instanceof CssStyleInjector) {
                        return item.inject();
                    }

                    return remapObject(item, toDevIdOrValue);
                }),
            style:
                options.s &&
                remapObject(options.s, value => {
                    return typeof value === "number"
                        ? `${value}px`
                        : value instanceof Array
                          ? value.map(v => `${v}px`).join(" ")
                          : typeof value === "string"
                            ? value
                            : (toDevId(value) ?? "");
                }),
            events: options.e && remapObject(options.e, toDevValue),
            bind: options.b && remapObject(options.b, toDevIdOrValue),
        });
    }

    public override applyOptions(options: DevTagOptions): void {
        if (options.e) {
            for (const [key, handler] of Object.entries(options.e)) {
                if (handler instanceof Array) {
                    const userHandler = handler[0];

                    handler[0] = ev => {
                        inspector.eventTrigger({
                            target: this.id,
                            eventName: key,
                            time: Date.now(),
                            position: getPosition(handler[0]),
                        });
                        userHandler(ev);
                    };
                } else {
                    options.e[key] = ev => {
                        inspector.eventTrigger({
                            target: this.id,
                            eventName: key,
                            time: Date.now(),
                            position: getPosition(handler),
                        });
                        handler(ev);
                    };
                }
            }
        }
        super.applyOptions(options);
    }

    public override destroy(deep: number, keepNodes?: boolean): void {
        inspector.destroy({ id: this.id, time: Date.now() });
        super.destroy(deep, keepNodes);
    }

    public override compose(): void {
        super.compose();
        Object.defineProperty(this.node, "vasille", { value: this.id, configurable: false, enumerable: false });
    }
}

export class DevRunner extends Runner<DevTagOptions> implements IRunner<Node, Element, DevTagOptions> {
    public override textNode(deep: number, text: unknown): TextNode<DevTagOptions, DevRunner> {
        if (text instanceof PositionedText) {
            return new DevTextNode({ text: text.text }, this, deep, text.position);
        }

        return new TextNode({ text: text }, this, deep);
    }

    public override tag(
        deep: number,
        tagName: string,
        input: DevTagOptions,
        cb?: ((ctx: DevTag) => void) | undefined,
    ): DevTag {
        if (cb) {
            input.l = cb;
        }

        return new DevTag(input, this, deep, tagName, input.usage);
    }
}
