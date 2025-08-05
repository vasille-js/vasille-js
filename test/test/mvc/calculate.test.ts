import { mount } from "vasille-web";
import { control, Component } from "../../src/mvc/calculate";
import { page } from "../page";

it("MVC calculate call", function() {
  const body = page.window.document.body;

  mount(body, Component, {});

  expect(body.children.length).toBe(1);
  expect(body.children[0].innerHTML).toBe("Hello +test!");
  control?.setValue("world")
  expect(body.children[0].innerHTML).toBe("Hello +world!");
})
