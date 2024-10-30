import { compose } from "vasille-dx";

export const C = compose(() => {
    const recusive = function compose(x: number) {
        return x <= 0 ? 1 : compose(x - 1) + x;
    };
    const sum = recusive(2);
});
