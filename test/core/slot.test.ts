import {Fragment, Slot} from "../../src";

const slot = new Slot<number>();
const fragment = new Fragment();

let test = 1;

const handler = (f : Fragment, x : number) => {
    test = x;
}

it('Slot', function () {
    slot.predefine((f, x) => {
        test = x * 2;
    }, fragment, 1);
    expect(test).toBe(2);

    slot.insert(handler);
    slot.release(fragment, 1);
    expect(test).toBe(1);

    slot.predefine((f, x) => {
        test = x * 3;
    }, fragment, 1);
    expect(test).toBe(1);
});
