import { compose } from "vasille-web";
const C = compose(Vasille => {
  Vasille.tag("div", {
    callback: div => {
      console.log(div);
    }
  });
}, "C");