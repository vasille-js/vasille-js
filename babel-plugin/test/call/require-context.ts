import * as DX from "vasille-dx";

export const C = DX.compose(() => {
  const a = DX.awaited(new Promise(rv => { rv(0) }));
});
