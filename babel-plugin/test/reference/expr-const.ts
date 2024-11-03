import { compose } from "vasille-dx";

export const C = compose(() => {
    let a = 2;
    let b = 3;
    const sum = a + b;

    console.log(sum);
});
