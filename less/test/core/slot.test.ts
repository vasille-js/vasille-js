import {page} from "../page";
import {v, predefine, AppOptions} from "../../src";

interface MyOpts extends AppOptions<any> {
    slot ?: (x : number) => void
}

let test = 1;

const fragment = v.app<MyOpts>(opts => {
    opts.slot = predefine(opts.slot, (x) => {
        test = x * 2;
    });

    opts.slot(1);
    return {};
})

const handler = (x : number) => {
    test = x;
}

it('Slot', function () {
    fragment(page.window.document.body, {});
    expect(test).toBe(2);

    fragment(page.window.document.body, {slot: handler});
    expect(test).toBe(1);
});
