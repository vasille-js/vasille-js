import { store } from "vasille-web";

const S = store(() => {
  return {
    ...{ a: 1 },
  };
});
