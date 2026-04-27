import { compose } from "vasille-web";
const C = compose(Vasille => {
  // @ts-expect-error
  Vasille.tag("div", {
    a: {
      onclick: "onClick"
    }
  });
});