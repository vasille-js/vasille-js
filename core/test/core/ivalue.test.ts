import { Reference } from "../../src";

it("ivalue", function () {
    const error = "not-overwritten";
    const ref = new Reference(22);
    const nullRef = new Reference(null);

    expect(JSON.stringify(ref)).toBe("22");
    expect(`${ref}`).toBe("22");
    expect(`${nullRef}`).toBe("iValue<void>");
});
