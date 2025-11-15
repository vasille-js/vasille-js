import { IRunner } from "../node/runner.js";
import { RepeatNode, RepeatNodeOptions } from "./repeat-node.js";
import { ListenableModel } from "../models/model.js";

export interface BaseViewOptions<
    Node,
    Element,
    TagOptions extends object,
    K,
    T,
    Model extends ListenableModel<K, T>,
    Runner extends IRunner<Node, Element, TagOptions>,
> extends RepeatNodeOptions<Node, Element, TagOptions, Runner, T, K> {
    model: Model;
}

/**
 * Base class of default views
 * @class BaseView
 * @extends RepeatNode
 */
export class BaseView<
    Node,
    Element,
    TagOptions extends object,
    K,
    T,
    Model extends ListenableModel<K, T>,
    Runner extends IRunner<Node, Element, TagOptions> = IRunner<Node, Element, TagOptions>,
> extends RepeatNode<
    Node,
    Element,
    TagOptions,
    K,
    T,
    Runner,
    BaseViewOptions<Node, Element, TagOptions, K, T, Model, Runner>
> {
    model: Model;

    /**
     * Handler to catch values addition
     * @type {Function}
     */
    protected addHandler!: (index: K, value: T) => void;

    /**
     * Handler to catch values removes
     * @type {Function}
     */
    protected removeHandler!: (index: K, value: T) => void;

    public constructor(input: BaseViewOptions<Node, Element, TagOptions, K, T, Model, Runner>, runner: Runner) {
        super(input, runner);
        this.model = input.model;
    }

    public override compose() {
        this.addHandler = (id, item) => {
            this.createChild(id, item);
        };
        this.removeHandler = (id, item) => {
            this.destroyChild(id, item);
        };

        this.model.listener.onAdd(this.addHandler);
        this.model.listener.onRemove(this.removeHandler);
    }

    public override destroy(): void {
        this.model.listener.offAdd(this.addHandler);
        this.model.listener.offRemove(this.removeHandler);
        super.destroy();
    }
}
