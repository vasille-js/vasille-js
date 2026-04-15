import { compose } from "vasille-web";
const C = compose(Vasille => {
  const arr = [{
    x: 1
  }];
  for (const {
    x
  } of arr) {
    Vasille.tag("div", {}, Vasille => {
      Vasille.text(x);
    });
  }
  arr.forEach(({
    x
  }, index) => {
    Vasille.tag("div", {}, Vasille => {
      Vasille.text(x + index);
    });
  });
});