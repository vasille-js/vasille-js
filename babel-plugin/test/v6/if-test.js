import { compose } from "vasille-web";
const C = compose(Vasille => {
  if (1) {
    Vasille.text("1");
  } else if (2) {
    Vasille.text("2");
  } else {
    Vasille.text("3");
  }
  if (1) {
    Vasille.text("1");
  } else if (2) {
    Vasille.text("2");
  }
  if (1) {
    Vasille.text("1");
  }
  if (1) Vasille.text("1");else Vasille.text("2");
  if (1) Vasille.text("3");
});