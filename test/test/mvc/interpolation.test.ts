import { mount } from "vasille-web";
import { control, Component } from "../../src/mvc/interpolation";
import { page } from "../page";

it("Interpolation of hybrid & MVVM", function () {
  const body = page.window.document.body;

  mount(body, Component, {});

  expect(body.children.length).toBe(1);
  expect(body.children[0].innerHTML).toBe("10 to 12");
  control?.setRootValue(7);
  expect(body.children[0].innerHTML).toBe("7 to 12");
  control?.setModelValue(20);
  expect(body.children[0].innerHTML).toBe("7 to 20");
});
