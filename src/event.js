// @flow

import { Value } from "./value.js";



/**
 * Covert a event function to a Vasille.js value
 * @param ts {BaseNode} is the this component
 * @param name {String} is the event name
 * @param handler {Function} is the handler function
 * @returns {Value} a Vasille.js value
 */
export function eventify (
    ts : any,
    name : string,
    handler : Function
) : Value<Function> {
    let listener = handler.bind(null, ts);
    let value = new Value(listener);
    let el = ts.el;

    el.addEventListener(name, listener);
    value.on(function () {
        el.removeEventListener(name, this.listener);
        this.listener = value.$.bind(null, ts);
        el.addEventListener(name, this.listener);
    }.bind({ listener }));

    return value;
}
