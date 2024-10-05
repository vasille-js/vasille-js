import {internalError, notOverwritten, userError, wrongBinding} from "../../src/core/errors";

it("not-overwritten", function () {
    expect(notOverwritten()).toBe("not-overwritten");
});

it("internal-error", function () {
    expect(internalError("test")).toBe("internal-error");
});

it("user-error", function () {
    expect(userError("test", "error")).toBe("error");
});

it("wrong-binding", function () {
    expect(wrongBinding("test")).toBe("wrong-binding");
});
