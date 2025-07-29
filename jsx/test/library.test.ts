import { awaited } from "../src/index.js";
import { createNode } from "./page.js";

let counter = 0;

it("awaited", function (done) {
    const [frag] = createNode();
    const promise = new Promise(rv => setTimeout(() => rv(2)));
    const errPromise = new Promise((_, rj) => setTimeout(() => rj(4)));
    const [successErr, successResult] = awaited(frag, promise, "successErr", "successResult");
    const [mustFailErr, mustFailResult] = awaited(frag, errPromise);
    const [counterError, counterState, increase] = awaited(frag, () => {
        return new Promise((resolve, reject) => {
            if (counter < 2) {
                resolve(++counter);
            } else {
                reject(counter);
            }
        });
    });

    expect(successErr.$).toBeUndefined();
    expect(successResult.$).toBeUndefined();
    expect(mustFailErr.$).toBeUndefined();
    expect(mustFailResult.$).toBeUndefined();
    increase();

    setTimeout(() => {
        expect(successErr.$).toBeUndefined();
        expect(successResult.$).toBe(2);
        expect(mustFailErr.$).toBe(4);
        expect(mustFailResult.$).toBeUndefined();
        expect(counterState.$).toBe(1);
        expect(counterError.$).toBeUndefined();
        increase();

        setTimeout(() => {
            expect(counterState.$).toBe(2);
            expect(counterError.$).toBeUndefined();
            increase();

            setTimeout(() => {
                expect(counterState.$).toBeUndefined();
                expect(counterError.$).toBe(2);
                frag.destroy();
                done();
            });
        });
    });
});

it("awaited synchronous", function () {
    const [frag] = createNode();
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
