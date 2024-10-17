import { RepeatNode, RNO } from "./repeat-node";
import { ListenableModel } from "../models/model";

export interface BSO<K, T, Model extends ListenableModel<K, T>> extends RNO<T, K> {
    model: Model;
}

/**
 * Base class of default views
 * @class BaseView
 * @extends RepeatNode
 * @implements IModel
 */
export class BaseView<K, T, Model extends ListenableModel<K, T>> extends RepeatNode<K, T, BSO<K, T, Model>> {
    public readonly input!: BSO<K, T, Model>;

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

    public constructor(input: BSO<K, T, Model>) {
        super(input);
    }

    protected compose(input: BSO<K, T, Model>) {
        this.addHandler = (id, item) => {
            this.createChild(input, id, item);
        };
        this.removeHandler = (id, item) => {
            this.destroyChild(id, item);
        };

        input.model.listener.onAdd(this.addHandler);
        input.model.listener.onRemove(this.removeHandler);
    }

    public destroy(): void {
        this.input.model.listener.offAdd(this.addHandler);
        this.input.model.listener.offRemove(this.removeHandler);
    }
}
