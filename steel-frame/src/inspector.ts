import { AbstractInspector, earlyInspector } from "vasille-jsx/dev";
import type { AppSide, IdeSide } from "./communication.js";
import { App, Fragment, Reactive } from "vasille";
import { TagOptions, TextNode, Runner } from "vasille/web-runner";
import { expr, ref } from "vasille-jsx";
import { DevFragment, DevTag, DevTextNode } from "vasille/dev";

class AppHandler implements AppSide {
    private canvas: HTMLCanvasElement | null = null;
    private app: App<Node, Element, TagOptions> | null = null;
    private active = ref(false);
    private $width = ref(window.innerWidth);
    private $height = ref(window.innerHeight);

    public constructor() {
        window.onresize = () => {
            this.$width.V = window.innerWidth;
            this.$height.V = window.innerHeight;
        };
    }

    public setup(app: App<Node, Element, TagOptions>, bridge: Inspector): void {
        this.app = app;

        app.tag("canvas", {
            a: {
                width: this.$width,
                height: this.$height,
            },
            s: {
                "pointer-events": expr(app, active => (active ? "auto" : "none"), [this.active]),
                position: "fixed",
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

                    if (document.caretPositionFromPoint) {
                        textNode = document.caretPositionFromPoint(ev.clientX, ev.clientY)?.offsetNode;
                    } else if (document.caretRangeFromPoint) {
                        textNode = document.caretRangeFromPoint(ev.clientX, ev.clientY)?.startContainer;
                    }

                    this.active.V = true;

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

        const tags = new Set<DevTag>();
        const texts = new Set<DevTextNode>();

        this.iterateFragment(this.app as unknown as Fragment<Node, Element, TagOptions>, new Set(ids), tags, texts);

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

        const sel = window.getSelection();

        if (sel) {
            sel.removeAllRanges();

            for (const text of texts) {
                const range = document.createRange();
                // @ts-expect-error node field is protected
                range.selectNodeContents(text.node);
                sel.addRange(range);
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
        set: Set<DevTag>,
        texts: Set<DevTextNode>,
    ) {
        for (const child of node.children) {
            if ("id" in child && ids.has(child.id as number)) {
                this.addReactive(child, set, texts);
            } else if (child instanceof Fragment) {
                this.iterateFragment(child, ids, set, texts);
            }
        }
    }

    protected addTag(node: DevTag, set: Set<DevTag>) {
        set.add(node);
    }

    protected addText(node: DevTextNode, set: Set<DevTag>) {
        let it = node.parent;

        while (it instanceof DevFragment) {
            it = it.parent;
        }

        if (it instanceof DevTag) {
            set.add(it);
        }
    }

    protected addFragment(node: DevFragment<Node, Element, TagOptions>, set: Set<DevTag>, texts: Set<DevTextNode>) {
        for (const child of node.children) {
            this.addReactive(child, set, texts);
        }
    }

    protected addReactive(node: Reactive, set: Set<DevTag>, texts: Set<DevTextNode>) {
        if (node instanceof DevTag) {
            this.addTag(node, set);
        } else if (node instanceof DevTextNode) {
            this.addText(node, set);
            texts.add(node);
        } else if (node instanceof DevFragment) {
            this.addFragment(node, set, texts);
        }
    }
}

export class Inspector extends AbstractInspector implements IdeSide {
    private ws: WebSocket | null;
    private queue: (readonly [string, unknown[]])[];
    private app: AppHandler;
    private clean: boolean = false;

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

    public clear() {
        this.sendMessage(this.clear.name, []);
    }

    private _connect() {
        const ws = (this.ws = new WebSocket("ws://localhost:7374"));

        ws.onopen = () => {
            if (!this.clean) {
                ws.send(JSON.stringify(["clear", []]));
                this.clean = true;
            }
            // Send all queued messages
            while (this.queue.length > 0) {
                ws.send(JSON.stringify(this.queue.shift()));
            }
        };

        ws.onmessage = ev => {
            const [method, args] = JSON.parse(ev.data) as [string, unknown[]];

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
