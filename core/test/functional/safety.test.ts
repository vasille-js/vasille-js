import { Reference, setErrorHandler, reportError, safe } from "../../src/index.js";

it("SetErrorHandler", function () {
    let test = false;
    const ref = new Reference(0);

    ref.on(() => {
        throw 23;
    });

    ref.V = 1;
    setErrorHandler(e => {
        test = e === 23;
    });
    expect(test).toBe(false);
    ref.V = 2;
    expect(test).toBe(true);
    reportError(22);
    expect(test).toBe(false);
    reportError(23);
    expect(test).toBe(true);
});

it("safe test", function (done) {
    let promise = false;
    let error = new Error();

    setErrorHandler(e => {
        promise = true;
        expect(e).toBe(error);
    });
    safe(() => {
        return Promise.reject(error);
    })();
    setTimeout(() => {
        let direct = false;

        expect(promise).toBe(true);

        setErrorHandler(e => {
            direct = true;
            expect(e).toBe(error);
        });
        safe(() => {
            throw error;
        })();
        expect(direct).toBe(true);
        done();
    });
});
