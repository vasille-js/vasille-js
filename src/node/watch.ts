// @flow
import { Fragment } from "./node";
import { Slot } from "../core/slot";
import { IValue } from "../core/ivalue";

export class Watch extends Fragment {
    protected slot : Slot;
    protected model : IValue<any>;

    public constructor () {
        super ();
        this.slot = new Slot;
        this.model = this.$ref(null);
        this.$seal ();
    }

    public $createWatchers () {
        this.$watch(() => {
            this.$children.forEach(child => {
                child.$destroy();
            });
            this.$children.splice(0);
            this.slot.release(this);
        }, this.model);
    }

    public $compose () {
        this.slot.release(this);
    }
}
