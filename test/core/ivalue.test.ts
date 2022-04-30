import {IValue} from "../../src";

const ivalue = new IValue(true);
const ivalue2 = new IValue(false);

it('ivalue', function () {
    const error = "not-overwritten";

    expect(() => ivalue.$).toThrow(error);
    expect(() => ivalue.$ = null).toThrow(error);
    expect(() => ivalue.$on(() => 0)).toThrow(error);
    expect(() => ivalue.$off(() => 0)).toThrow(error);
    expect(() => ivalue.$enable()).toThrow(error);
    expect(() => ivalue.$disable()).toThrow(error);
})
