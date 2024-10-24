import { Fragment, Pointer, Reactive, Reference } from "vasille";
import { asFragment, readValue, setValue } from "../src/inline";

it("read value", function () {
    const nr = 4;
    const ref = new Reference(2);

    expect(readValue(nr)).toBe(nr);
    expect(readValue(ref)).toBe(ref.$);
});

it("set value", function () {
    let nr: unknown = 4;
    const ref = new Reference(2);
    const ref2 = new Reference(3);
    const point = new Pointer(ref);

    setValue(nr, 5);
    expect(nr).toBe(4);
    setValue(nr, 14, v => (nr = v));
    expect(nr).toBe(14);

    setValue(ref, 12);
    expect(ref.$).toBe(12);

    setValue(ref, ref2);
    expect(ref.$).toBe(ref2.$);

    expect(point.$).toBe(ref.$);
    setValue(point, ref2);
    expect(point.$).toBe(ref2.$);
});

it("as Fragment", function () {
    const reactive = new Reactive({});
    const fragment = new Fragment({});

    expect(asFragment(fragment)).toBe(fragment);
    expect(() => asFragment(reactive)).toThrow("out-of-context");
});
