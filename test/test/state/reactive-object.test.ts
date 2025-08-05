import { mount } from "vasille-web";
import { control, Component } from "../../src/state/reactive-object";
import { page } from "../page";

it("dynamic component with reactive object", function() {
  const body = page.window.document.body;

  mount(body, Component, {});

  expect(body.children.length).toBe(1);
  expect(body.children[0].innerHTML).toBe("Hello test!");
  control?.setValue("world")
  expect(body.children[0].innerHTML).toBe("Hello world!");
})
