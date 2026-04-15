import { compose } from "vasille-web";
const C = compose(Vasille => {
  const map = new Map([[1, 2]]);
  for (const [key, value] of map) {
    Vasille.tag("div", {}, Vasille => {
      Vasille.text(key + value);
    });
  }
});