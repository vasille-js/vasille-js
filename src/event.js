// @flow

import { Value } from "./value.js";



/**
 * Covert a event function to a Vasille.js value
 * @param rt {BaseNode} is the root component
 * @param ts {BaseNode} is the this component
 * @param name {String} is the event name
 * @param handler {Function} is the handler function
 * @returns {Value} a Vasille.js value
 */
export function eventify (
    rt : any,
    ts : any,
    name : string,
    handler : Function
) : Value {
    let listener = handler.bind ( null, rt, ts );
    let value = new Value ( listener );
    let el = ts.el;

    if (el) {
        el.addEventListener ( name, listener );
        value.on ( function () {
            el.removeEventListener ( name, this.listener );
            this.listener = value.get ().bind ( null, rt, ts );
            el.addEventListener ( name, this.listener );
        }.bind ( { listener } ) );
    }

    return value;
}
