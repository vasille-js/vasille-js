import { AbstractInspector, earlyInspector } from "vasille-jsx/dev";
import type { AppSide, IdeSide } from "./communication.js";
import { App, Fragment, Reactive } from "vasille";
import { TagOptions, TextNode, Runner } from "vasille/web-runner";
import { expr, ref } from "vasille-jsx";
import { DevFragment, DevTag } from "vasille/dev";

class AppHandler implements AppSide {
    private canvas: HTMLCanvasElement | null = null;
    private app: App<Node, Element, TagOptions> | null = null;
    private active = ref(false);

    public setup(app: App<Node, Element, TagOptions>, bridge: Inspector): void {
        this.app = app;

        app.tag("canvas", {
            s: {
                "pointer-events": expr(app, active => (active ? "auto" : "none"), [this.active]),
                position: "absolute",
                inset: "0",
                "z-index": "9999909",
            },
            k: canvas => {
                this.canvas = canvas as HTMLCanvasElement;
            },
            e: {
                pointermove: (ev: PointerEvent) => {
                    const canvas = this.canvas;
                    const ctx = canvas?.getContext("2d");
                    let element: Element | null;

                    if (!ctx || !canvas) {
                        return;
                    }
                    ev.preventDefault();
                    this.active.V = false;
                    element = document.elementFromPoint(ev.clientX, ev.clientY);

                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.fillStyle = "#ff000030";

                    if (element) {
                        const rect = element.getBoundingClientRect();

                        ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
                    }
                    this.active.V = true;
                },
                pointerdown: (ev: PointerEvent) => {
                    const ids: number[] = [];
                    const key = "vasille";
                    let textNode: Node | null | undefined = null;
                    let elements: Element[];

                    ev.preventDefault();
                    this.active.V = false;
                    elements = document.elementsFromPoint(ev.clientX, ev.clientY);
                    this.active.V = true;

                    if (document.caretPositionFromPoint) {
                        textNode = document.caretPositionFromPoint(ev.clientX, ev.clientY)?.offsetNode;
                    } else if (document.caretRangeFromPoint) {
                        textNode = document.caretRangeFromPoint(ev.clientX, ev.clientY)?.startContainer;
                    }

                    if (textNode && key in textNode) {
                        ids.push(textNode[key] as number);
                    }
                    for (const element of elements) {
                        if (key in element) {
                            ids.push(element[key] as number);
                        }
                    }
                    bridge.listDebugItems(ids);
                    this.active.V = false;

                    const canvas = this.canvas;
                    const ctx = canvas?.getContext("2d");

                    if (ctx && canvas) {
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                    }
                },
            },
        });
    }

    public highlight(ids: number[]): void {
        if (this.app === null) {
            return;
        }

        const tags = new Set<DevTag<Node, Element, TagOptions>>();

        this.iterateFragment(this.app as unknown as Fragment<Node, Element, TagOptions>, new Set(ids), tags);

        const canvas = this.canvas;
        const ctx = canvas?.getContext("2d");

        if (ctx && canvas) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "#ff000030";

            for (const tag of tags) {
                const rect = tag.getNode().getBoundingClientRect();

                ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
            }
        }
    }
    public setLookup(active: boolean): void {
        this.active.V = active;

        const canvas = this.canvas;
        const ctx = canvas?.getContext("2d");

        if (ctx && canvas) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            if (active) {
                ctx.fillStyle = "#ff000030";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
        }
    }

    protected iterateFragment(
        node: Fragment<Node, Element, TagOptions>,
        ids: Set<number>,
        set: Set<DevTag<Node, Element, TagOptions>>,
    ) {
        for (const child of node.children) {
            if ("id" in child && ids.has(child.id as number)) {
                this.addReactive(child, set);
            } else if (child instanceof Fragment) {
                this.iterateFragment(child, ids, set);
            }
        }
    }

    protected addTag(node: DevTag<Node, Element, TagOptions>, set: Set<DevTag<Node, Element, TagOptions>>) {
        set.add(node);
    }

    protected addText(node: TextNode<TagOptions, Runner<TagOptions>>, set: Set<DevTag<Node, Element, TagOptions>>) {
        let it = node.parent;

        while (it instanceof DevFragment) {
            it = it.parent;
        }

        if (it instanceof DevTag) {
            set.add(it);
        }
    }

    protected addFragment(node: DevFragment<Node, Element, TagOptions>, set: Set<DevTag<Node, Element, TagOptions>>) {
        for (const child of node.children) {
            this.addReactive(child, set);
        }
    }

    protected addReactive(node: Reactive, set: Set<DevTag<Node, Element, TagOptions>>) {
        if (node instanceof DevTag) {
            this.addTag(node, set);
        } else if (node instanceof TextNode) {
            this.addText(node, set);
        } else if (node instanceof DevFragment) {
            this.addFragment(node, set);
        }
    }
}

export class Inspector extends AbstractInspector implements IdeSide {
    private ws: WebSocket | null;
    private queue: (readonly [string, unknown[]])[];
    private app: AppHandler;

    constructor() {
        super();
        this.ws = null;
        this.queue = [];
        this.app = new AppHandler();
        this._connect();
        earlyInspector.connect(this);
    }

    public setup(app: App<Node, Element, TagOptions>) {
        this.app.setup(app, this);
    }

    public callInspector(method: string, arg: object) {
        this.sendMessage(this.callInspector.name, [method, arg]);
    }

    public listDebugItems(ids: number[]) {
        this.sendMessage(this.listDebugItems.name, [ids]);
    }

    private _connect() {
        const ws = (this.ws = new WebSocket("ws://localhost:7374"));

        ws.onopen = () => {
            // Send all queued messages
            while (this.queue.length > 0) {
                ws.send(JSON.stringify(this.queue.shift()));
            }
        };

        ws.onmessage = ev => {
            const [method, args] = ev.data as [string, unknown[]];

            this.app[method](...args);
        };

        ws.onclose = () => {
            setTimeout(() => this._connect(), 1000);
        };

        ws.onerror = () => {
            ws.close();
        };
    }

    protected send(method: string, arg: object) {
        this.callInspector(method, arg);
    }

    private sendMessage(method: string, args: unknown[]) {
        const message = [method, args] as const;
        const ws = this.ws;
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(message));
        } else {
            this.queue.push(message);
        }
    }
}
