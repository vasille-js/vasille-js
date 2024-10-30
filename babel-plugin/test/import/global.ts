import * as DX from "vasille-dx";

export const C = DX.compose(({ a }: { a: number }) => {
    a = 3;
});
