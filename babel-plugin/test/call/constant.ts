import * as DX from "vasille-dx";

const prop = "compose";

export const C = DX[prop](({ a }: { a: number }) => {
  a = 3;
});
