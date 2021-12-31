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
        const $ : ObjectViewPrivate<T> = this.$;
        const handler = super.createChild(id, item, before);

        if (item instanceof IValue) {
            item.on(handler);
        }
        $.handlers[id] = handler;
    }

    public destroyChild (id : string, item : T) {
        const $ : ObjectViewPrivate<T> = this.$;

        if (item instanceof IValue) {
            item.off($.handlers[id]);
        }
        delete $.handlers[id];
        super.destroyChild(id, item);
    }

    public $ready () {
        const $ : ObjectViewPrivate<T> = this.$;
        const obj : ObjectModel<T> = this.model.$;

        for (const i in obj) {
            // eslint-disable-next-line no-prototype-builtins
            if (obj.hasOwnProperty(i) && obj.get(i) instanceof IValue) {
                $.app.$run.callCallback(() => {
                    this.createChild(i, obj.get(i));
                });
            }
        }

        super.$ready();
    }

    public $destroy () {
        const $ : ObjectViewPrivate<T> = this.$;
        const obj : ObjectModel<T> = this.model.$;

        for (const i in obj) {
            // eslint-disable-next-line no-prototype-builtins
            if (obj.hasOwnProperty(i)) {
                const item = obj.get(i);

                if (item instanceof IValue) {
                    item.off($.handlers[i]);
                }
            }
        }

        $.$destroy();
        super.$destroy();
    }
}

