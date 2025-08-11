import { Runner } from "../node/runner.js";
import { RepeatNode, RepeatNodeOptions } from "./repeat-node.js";
import { ListenableModel } from "../models/model.js";

export interface BaseViewOptions<Node, Element, TagOptions extends object, K, T, Model extends ListenableModel<K, T>>
    extends RepeatNodeOptions<Node, Element, TagOptions, T, K> {
    model: Model;
}

/**
 * Base class of default views
 * @class BaseView
 * @extends RepeatNode
 * @implements IModel
 */
export class BaseView<
    Node,
    Element,
    TagOptions extends object,
    K,
    T,
    Model extends ListenableModel<K, T>,
> extends RepeatNode<Node, Element, TagOptions, K, T, BaseViewOptions<Node, Element, TagOptions, K, T, Model>> {
    public readonly input!: BaseViewOptions<Node, Element, TagOptions, K, T, Model>;

    /**
     * Handler to catch values addition
     * @type {Function}
     */
    protected addHandler: (index: K, value: T) => void;

    /**
     * Handler to catch values removes
     * @type {Function}
     */
    protected removeHandler: (index: K, value: T) => void;

    public constructor(
        input: BaseViewOptions<Node, Element, TagOptions, K, T, Model>,
        runner: Runner<Node, Element, TagOptions>,
    ) {
        super(input, runner);
    }

    public compose() {
        this.addHandler = (id, item) => {
            this.createChild(this.input, id, item);
        };
        this.removeHandler = (id, item) => {
            this.destroyChild(id, item);
        };

        this.input.model.listener.onAdd(this.addHandler);
        this.input.model.listener.onRemove(this.removeHandler);
    }

    public destroy(): void {
        this.input.model.listener.offAdd(this.addHandler);
        this.input.model.listener.offRemove(this.removeHandler);
        super.destroy();
    }
}
