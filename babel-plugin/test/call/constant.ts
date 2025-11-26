import * as DX from "steel-frame";

const prop = "compose";

const C = DX[prop](({ a }: { a: number }) => {
  a = 3;
});
