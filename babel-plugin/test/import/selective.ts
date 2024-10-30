import { compose } from "vasille-dx";

export const C = compose(({ a }: { a: number }) => {
    a = 3;
});
