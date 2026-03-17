// @ts-ignore
import "./TestComponent.tsx";
// @ts-ignore
import "@/components/TestSecondComponent.js";
// @ts-ignore
import { TestFourthComponent } from "@/components/not-local/TestFourthComponent.jsx";
import { component } from "vasille-shadow";
export const LocalComponent = component(Vasille => {
  Vasille.tag("test-component", {
    b: {
      name: "first"
    }
  }, (_VasilleWeb, Vasille) => {
    Vasille.tag("div", {});
  });
  // this will trigger an error when field name is changed
  // match it with previous one
  Vasille.tag("test-second-component", {
    b: {
      name: "third",
      id: 1,
      onClick: () => {
        console.log("test");
      }
    }
  });
  // this must not be threaded as a local component
  Vasille.tag("div", {
    b: {
      autofocus: true
    }
  }, Vasille => {
    Vasille.tag("span", {});
  });
  TestFourthComponent({
    name: "fourth"
  }, Vasille);
}, "local-component", {});