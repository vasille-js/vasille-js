import { page } from "vasille-ssg";
export default page(async Vasille => {
  Vasille.tag("div", {});
  Vasille.tag("head", {}, Vasille => {
    Vasille.tag("title", {}, Vasille => {
      Vasille.text("SSG");
    });
  });
  Vasille.tag("body", {
    a: {
      class: "ssg"
    }
  });
});