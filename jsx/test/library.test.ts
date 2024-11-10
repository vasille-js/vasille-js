import { awaited } from "../src";
import { createNode } from "./page";

it("awaited", function (done) {
    const frag = createNode();
    const promise = new Promise(rv => setTimeout(() => rv(2)));
    const errPromise = new Promise((_, rj) => setTimeout(() => rj(4)));
    const [successErr, successResult] = awaited(frag, promise);
    const [mustFailErr, mustFailResult] = awaited(frag, errPromise);

    expect(successErr.$).toBeUndefined();
    expect(successResult.$).toBeUndefined();
    expect(mustFailErr.$).toBeUndefined();
    expect(mustFailResult.$).toBeUndefined();

    setTimeout(() => {
        expect(successErr.$).toBeUndefined();
        expect(successResult.$).toBe(2);
        expect(mustFailErr.$).toBe(4);
        expect(mustFailResult.$).toBeUndefined();
        frag.destroy();
        done();
    });
});

it("awaited synchronous", function () {
    const frag = createNode();
    const [successErr, successResult] = awaited(frag, () => {
        return 2 as unknown as Promise<2>;
    });
    const [mustFailErr, mustFailResult] = awaited(frag, (): Promise<4> => {
        throw 4;
    });

    expect(successErr.$).toBeUndefined();
    expect(successResult.$).toBe(2);
    expect(mustFailErr.$).toBe(4);
    expect(mustFailResult.$).toBeUndefined();
    frag.destroy();
});
