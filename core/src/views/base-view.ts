import { Root } from "../node/node";
import { RepeatNode, RepeatNodeOptions } from "./repeat-node";
import { ListenableModel } from "../models/model";

export interface BaseViewOptions<K, T, Model extends ListenableModel<K, T>> extends RepeatNodeOptions<T, K> {
    model: Model;
}

/**
 * Base class of default views
 * @class BaseView
 * @extends RepeatNode
 * @implements IModel
 */
export class BaseView<K, T, Model extends ListenableModel<K, T>> extends RepeatNode<
    K,
    T,
    BaseViewOptions<K, T, Model>
> {
    public readonly input!: BaseViewOptions<K, T, Model>;

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

    public constructor(parent: Root, input: BaseViewOptions<K, T, Model>, name?: string) {
        super(parent, input, name);
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
    }
}
