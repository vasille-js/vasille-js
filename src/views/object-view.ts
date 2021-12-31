import { BaseView, BaseViewPrivate } from "./base-view";
import { ObjectModel } from "../models/object-model";
import { Fragment } from "../node/node";
import { IValue } from "../core/ivalue";



/**
 * private part of object view
 * @class ObjectViewPrivate
 * @extends BaseViewPrivate
 */
export class ObjectViewPrivate<T> extends BaseViewPrivate<string, T> {
    /**
     * Handler of property changes
     * @type {Object<string, function>}
     */
    public handlers : { [key : string] : () => void } = {};

    public constructor () {
        super ();
        this.$seal();
    }

    $destroy() {
        super.$destroy();
        this.handlers = null;
    }
}

/**
 * Create a children pack for each object field
 * @class ObjectView
 * @extends BaseView
 */
export class ObjectView<T> extends BaseView<string, T, ObjectModel<T>> {
    protected $ : ObjectViewPrivate<T>;

    public constructor ($ ?: ObjectViewPrivate<T>) {
        super($ || new ObjectViewPrivate);
        this.model = this.$ref(new ObjectModel);
    }

    public createChild (id : string, item : T, before ?: Fragment) : any {
        let $ : ObjectViewPrivate<T> = this.$;
        let handler = super.createChild(id, item, before);

        if (item instanceof IValue) {
            item.on(handler);
        }
        $.handlers[id] = handler;
    }

    public destroyChild (id : string, item : T) {
        let $ : ObjectViewPrivate<T> = this.$;

        if (item instanceof IValue) {
            item.off($.handlers[id]);
        }
        delete $.handlers[id];
        super.destroyChild(id, item);
    }

    public $ready () {
        let $ : ObjectViewPrivate<T> = this.$;
        let obj : ObjectModel<T> = this.model.$;

        for (let i in obj) {
            if (obj.hasOwnProperty(i) && obj.get(i) instanceof IValue) {
                $.app.$run.callCallback(() => {
                    this.createChild(i, obj.get(i));
                });
            }
        }

        super.$ready();
    }

    public $destroy () {
        let $ : ObjectViewPrivate<T> = this.$;
        let obj : ObjectModel<T> = this.model.$;

        for (let i in obj) {
            if (obj.hasOwnProperty(i)) {
                let item = obj.get(i);

                if (item instanceof IValue) {
                    item.off($.handlers[i]);
                }
            }
        }

        $.$destroy();
        super.$destroy();
    }
}

