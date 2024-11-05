import { compose } from "vasille-dx";

export const C = compose(() => {
    let a = 3;
    const b = [1, 2, a];
    const c = new Set([1, 2, a]);
    const d = new Map([
        [1, a],
        [2, 3],
    ]);
    const e = {
        f: 1,
        e: 2,
        g: a,
    };

    console.log(a, b[0], c.has(a), d.get(1), e.g);
});
