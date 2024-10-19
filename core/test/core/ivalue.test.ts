import { IValue, Reference } from "../../src";

const ivalue = new IValue();

it("ivalue", function () {
    const error = "not-overwritten";
    const ref = new Reference(22);
    const nullRef = new Reference(null);

    expect(() => ivalue.$).toThrow(error);
    expect(() => (ivalue.$ = null)).toThrow(error);
    expect(() => ivalue.on(() => 0)).toThrow(error);
    expect(() => ivalue.off(() => 0)).toThrow(error);
    expect(JSON.stringify(ref)).toBe("22");
    expect(`${ref}`).toBe("22");
    expect(`${nullRef}`).toBe("iValue<void>");
});
