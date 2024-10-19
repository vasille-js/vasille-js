import { Reference, setErrorHandler, reportError } from "../../src";

it("SetErrorHandler", function () {
    let test = false;
    const ref = new Reference(0);

    ref.on(() => {
        throw 23;
    });

    ref.$ = 1;
    setErrorHandler(e => {
        test = e === 23;
    });
    expect(test).toBe(false);
    ref.$ = 2;
    expect(test).toBe(true);
    reportError(22);
    expect(test).toBe(false);
    reportError(23);
    expect(test).toBe(true);
});
