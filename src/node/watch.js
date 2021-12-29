// @flow
import { Fragment } from "./node";
import { Slot } from "../core/slot";
import { IValue } from "../core/ivalue";

export class Watch extends Fragment {
    slot : Slot<>;
    model : IValue<any>;

    constructor () {
        super ();
        this.slot = new Slot;
        this.model = this.$ref(null);
        this.$seal ();
    }

    $createWatchers () {
        this.$watch<any>((v : any) => {
            this.$children.forEach(child => {
                child.$destroy();
            });
            this.$children.splice(0);
            this.slot.release(this);
        }, this.model);
    }

    $compose () {
        this.slot.release(this);
    }
}
