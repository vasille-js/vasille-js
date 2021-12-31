import { BaseView, BaseViewPrivate } from "./base-view";
import { ArrayModel } from "../models/array-model";
import { IValue } from "../core/ivalue";
import { Fragment } from "../node/node";



/**
 * Private part of array view
 * @class ArrayViewPrivate
 * @extends BaseViewPrivate
 */
export class ArrayViewPrivate<T> extends BaseViewPrivate<T, T> {
    /**
     * Contains handlers of each child
     * @type {Map}
     */
    public handlers : Map<T, () => void> = new Map();

    public constructor () {
        super ();
        this.$seal();
    }

    $destroy() {
        super.$destroy();
        this.handlers.clear();
    }
}

/**
 * Represents a view of an array model
 * @class ArrayView
 * @extends BaseView
 */
export class ArrayView<T> extends BaseView<T, T, ArrayModel<T>> {
    protected $ : ArrayViewPrivate<T>;

    public constructor ($ ?: ArrayViewPrivate<T>) {
        super($ || new ArrayViewPrivate);

        this.model = this.$ref(new ArrayModel);
        this.$seal();
    }

    public createChild (id : T, item : T, before ?: Fragment) : any {
        let $ : ArrayViewPrivate<T> = this.$;
        let next = $.nodes.get(id);
        let handler = super.createChild(item, item, before || next);

        $.handlers.set(item, handler);
    }

    public destroyChild (id : T, item : T) {
        let $ : ArrayViewPrivate<T> = this.$;
        let handler = $.handlers.get (item);

        if (item instanceof IValue && handler) {
            item.off (handler);
        }
        $.handlers.delete(item);
        super.destroyChild(item, item);
    }

    public $ready () {
        let arr : ArrayModel<T> = this.model.$;

        for (let i = 0; i < arr.length; i++) {
            this.createChild(arr[i], arr[i]);
        }

        super.$ready();
    }

    public $destroy () {
        let $ : ArrayViewPrivate<T> = this.$;

        $.handlers.forEach((handler, value) => {
            if (value instanceof IValue) {
                value.off(handler);
            }
        });

        $.$destroy();
        super.$destroy();
    }
}
