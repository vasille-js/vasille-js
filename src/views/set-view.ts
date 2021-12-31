import { BaseView, BaseViewPrivate } from "./base-view";
import { SetModel } from "../models/set-model";
import { Fragment } from "../node/node";
import { IValue } from "../core/ivalue";



/**
 * private part of set view
 * @class SetViewPrivate
 * @extends BaseViewPrivate
 */
export class SetViewPrivate<T> extends BaseViewPrivate<null, T> {
    /**
     * Contains update handler for each value
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
 * Create a children pack for each set value
 * @class SetView
 * @extends BaseView
 */
export class SetView<T> extends BaseView<null, T, SetModel<T>> {
    protected $ : SetViewPrivate<T>;

    public constructor ($ ?: SetViewPrivate<T>) {
        super($ || new SetViewPrivate);
        this.model = this.$ref(new SetModel<T>());
    }

    public createChild (id : null, item : T, before ?: Fragment) : any {
        let $ : SetViewPrivate<T> = this.$;
        let handler = super.createChild(id, item, before);

        if (item instanceof IValue) {
            item.on(handler);
        }
        $.handlers.set(item, handler);
    }

    public destroyChild (id : null, item : T) {
        let $ : SetViewPrivate<T> = this.$;
        let handler = $.handlers.get(item);

        if (item instanceof IValue && handler) {
            item.off(handler);
        }
        $.handlers.delete(item);
        super.destroyChild(id, item);
    }

    public $ready () {
        let $ : SetViewPrivate<T> = this.$;
        let set : SetModel<T> = this.model.$;

        for (let it of set) {
            $.app.$run.callCallback(() => {
                this.createChild(null, it);
            });
        }

        super.$ready();
    }

    public $destroy () {
        let $ : SetViewPrivate<T> = this.$;
        let set : SetModel<T> = this.model.$;

        for (let it of set) {
            const handler = $.handlers.get (it);

            if (it instanceof IValue && handler) {
                it.off(handler);
            }
        }

        $.$destroy();
        super.$destroy();
    }
}

