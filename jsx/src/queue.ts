import { Fragment, safe } from "vasille";

export type QueueItem<Node, Element, TagOptions extends object> = {
    node: Fragment<Node, Element, TagOptions>;
    slot: (ctx: Fragment<Node, Element, TagOptions>) => void;
    done: boolean;
};

let queueTimer: number | null = null;
const queue: QueueItem<unknown, unknown, object>[] = [];

function processQueue() {
    const startTime = Date.now();
    let i = 0;

    queueTimer = null;
    for (; i < queue.length; i++) {
        const { node, slot } = queue[i];

        safe(slot)(node);
        queue[i].done = true;

        if (Date.now() - startTime >= 12) {
            break;
        }
    }
    queue.splice(0, i + 1);

    if (queue.length > 0) {
        queueTimer = setTimeout(processQueue, 6);
    }
}

export interface QueuedRenderProps {
    priority?: "high" | "low";
}

export function QueuedRender<Node, Element, TagOptions extends object>(
    props: QueuedRenderProps,
    ctx: Fragment<Node, Element, TagOptions>,
    defaultSlot?: (ctx: Fragment<Node, Element, TagOptions>) => void,
) {
    /* istanbul ignore else */
    if (defaultSlot) {
        const node = new Fragment<Node, Element, TagOptions>(ctx.runner);
        const item: QueueItem<Node, Element, TagOptions> = { done: false, node: node, slot: defaultSlot };

        // mount the newly created node to the parent
        ctx.create(node);

        if (props.priority === "high") {
            queue.unshift(item);
        } else {
            queue.push(item);
        }
        node.runOnDestroy(() => {
            if (!item.done) {
                const index = queue.indexOf(item);

                /* istanbul ignore else */
                if (index !== -1) {
                    queue.splice(index, 1);
                }
            }
        });
        if (queueTimer === null) {
            queueTimer = setTimeout(processQueue, 0);
        }
    }
}
