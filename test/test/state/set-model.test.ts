import { mount } from "vasille-web";
import { control, Component } from "../../src/state/set-model";
import { page } from "../page";

it("set model in component", function () {
  const body = page.window.document.body;

  mount(body, Component, {});

  expect(body.children.length).toBe(1);
  expect(body.children[0].innerHTML).toBe("Hello m!");
  control?.addValue("n");
  expect(body.children.length).toBe(2);
  expect(body.children[0].innerHTML).toBe("Hello m!");
  expect(body.children[1].innerHTML).toBe("Hello n!");
  control?.addValue("o");
  expect(body.children.length).toBe(3);
  expect(body.children[0].innerHTML).toBe("Hello m!");
  expect(body.children[1].innerHTML).toBe("Hello n!");
  expect(body.children[2].innerHTML).toBe("Hello o!");
  control?.removeValue("n");
  expect(body.children.length).toBe(2);
  expect(body.children[0].innerHTML).toBe("Hello m!");
  expect(body.children[1].innerHTML).toBe("Hello o!");
});
