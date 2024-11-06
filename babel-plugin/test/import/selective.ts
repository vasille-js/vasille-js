import { compose } from "vasille-dx";

export const C = compose(({ a = 0 }: { a: number }) => {
    a = 3;
});
