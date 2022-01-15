import { Fragment } from "./node";
import { Slot } from "../core/slot";
import { IValue } from "../core/ivalue";

/**
 * Watch Node
 * @class Watch
 * @extends Fragment
 */
export class Watch<T> extends Fragment {
    /**
     * Default slot
     * @type Slot
     */
    public slot : Slot<Fragment, T>;
    /**
     * iValue to watch
     * @type IValue
     */
    public model : IValue<T>;

    public constructor () {
        super ();
        this.slot = new Slot;
        this.model = this.$ref(null);
        this.$seal ();
    }

    public $createWatchers () {
        this.$watch((value) => {
            this.$children.forEach(child => {
                child.$destroy();
            });
            this.$children.splice(0);
            this.slot.release(this, value);
        }, this.model);
    }

    public $compose () {
        this.slot.release(this, this.model.$);
    }
}
