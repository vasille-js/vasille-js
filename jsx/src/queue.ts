import { Fragment, reportError, safe } from "vasille";

export type QueueItem<Node, Element, TagOptions extends object> = {
    node: Fragment<Node, Element, TagOptions>;
    slot: (ctx: Fragment<Node, Element, TagOptions>) => void;
    callback?: () => void;
    done: boolean;
};

let queueTimer: number | null = null;
const queue: QueueItem<unknown, unknown, object>[] = [];
let workingIndex = -1;

function processQueue() {
    const startTime = Date.now();
    workingIndex = 0;

    queueTimer = null;
    for (; workingIndex < queue.length; workingIndex++) {
        const { node, slot, callback } = queue[workingIndex];

        try {
            slot(node);
            callback?.();
        } catch (e) {
            reportError(e);
        }
        queue[workingIndex].done = true;

        if (Date.now() - startTime >= 12) {
            break;
        }
    }
    queue.splice(0, workingIndex + 1);
    workingIndex = -1;

    if (queue.length > 0) {
        queueTimer = setTimeout(processQueue, 6);
    }
}

export interface QueuedRenderProps {
    priority?: "high" | "low";
    callback?(): void;
}

export function QueuedRender<Node, Element, TagOptions extends object>(
    props: QueuedRenderProps,
    ctx: Fragment<Node, Element, TagOptions>,
    defaultSlot?: (ctx: Fragment<Node, Element, TagOptions>) => void,
) {
    /* istanbul ignore else */
    if (defaultSlot) {
        const node = new Fragment<Node, Element, TagOptions>(ctx.runner);
        const item: QueueItem<Node, Element, TagOptions> = {
            done: false,
            node: node,
            slot: defaultSlot,
            callback: props.callback,
        };

        // mount the newly created node to the parent
        ctx.create(node);

        if (props.priority === "high") {
            queue.splice(workingIndex + 1, 0, item);
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
