// @flow
import { Fragment } from "./node";
import { Slot } from "../core/slot";
import { IValue } from "../core/ivalue";

declare export class Watch extends Fragment {
    slot : Slot<>;
    model : IValue<any>;

    constructor () : void;

    $createWatchers () : void;
}
