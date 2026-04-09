import { compose } from "vasille-web";
const C = compose(Vasille => {
  Vasille.tag("div", {}, Vasille => {
    Vasille.tag("span", {}, Vasille => {
      Vasille.text("- ");
    });
    Vasille.tag("span", {}, Vasille => {
      Vasille.text(" -");
    });
    Vasille.tag("span", {}, Vasille => {
      Vasille.text(" - ");
    });
    Vasille.tag("span", {}, Vasille => {
      Vasille.text(" ");
    });
    Vasille.tag("span", {}, Vasille => {
      Vasille.text("First");
      Vasille.text(" ");
      Vasille.text("sassssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss");
    });
  });
});