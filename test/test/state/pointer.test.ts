import { mount } from "vasille-web";
import { control, Component } from "../../src/state/pointer";
import { page } from "../page";

it("pointer in component", function() {
  const body = page.window.document.body;

  mount(body, Component, {});

  expect(body.children.length).toBe(1);
  expect(body.children[0].innerHTML).toBe("Hello 3!");
  control?.setValue(1)
  expect(body.children[0].innerHTML).toBe("Hello 2!");
  control?.updatePointer()
  expect(body.children[0].innerHTML).toBe("Hello 4!");
  control?.setValue(0)
  expect(body.children[0].innerHTML).toBe("Hello 3!");
})
