import { compose } from "vasille-web";
const C = compose(Vasille => {
  const arr = [1, 2, 3];
  for (const number of arr) {
    Vasille.tag("div", {}, Vasille => {
      Vasille.text(number);
    });
  }
  arr.forEach((item, index) => {
    Vasille.tag("div", {}, Vasille => {
      Vasille.text(item + index);
    });
  });
  for (const item of arr) item + 1;
});