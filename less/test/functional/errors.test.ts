import {arrayModel, debug, mapModel, objectModel, setModel, v} from "../../src";
import {Extension} from "vasille";
import {f, c, a, e} from "./stack.test";

it('stack error', function () {
    expect(() => arrayModel()).toThrow('out-of-context');
    expect(() => setModel()).toThrow('out-of-context');
    expect(() => objectModel()).toThrow('out-of-context');
    expect(() => mapModel()).toThrow('out-of-context');
    expect(() => f({})).toThrow('out-of-context');
    expect(() => c({})).toThrow('out-of-context');
    expect(() => e({})).toThrow('out-of-context');
    expect(() => v.tag("div", {})).toThrow('out-of-context');
    expect(() => v.create(new Extension({}), () => 0)).toThrow('out-of-context');
    expect(() => v.text(2 as any)).toThrow('out-of-context');
    expect(() => debug(2 as any)).toThrow('out-of-context');
    expect(() => v.if(2 as any, () => 0)).toThrow('logic-error');
    expect(() => v.elif(2 as any, () => 0)).toThrow('logic-error');
    expect(() => v.else(() => 0)).toThrow('logic-error');
})
