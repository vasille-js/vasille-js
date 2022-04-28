import {page} from "../page";
import {App, Options} from "../../src";
import {v} from "../../src/v";
import {predefine} from "../../src/functional/components";

interface MyOpts extends Options {
    slot ?: (node : App, x : number) => void
}

let test = 1;

const fragment = v.app<MyOpts>(opts => {
    opts.slot = predefine(opts.slot, (node, x) => {
        test = x * 2;
    })

    opts.slot(this, 1);
})

const handler = (node : App, x : number) => {
    test = x;
}

it('Slot', function () {
    fragment(page.window.document.body, {});
    expect(test).toBe(2);

    fragment(page.window.document.body, {slot: handler});
    expect(test).toBe(1);
});
