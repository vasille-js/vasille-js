import { mount } from "vasille-web";
import { model, Component } from "../../src/store/set-model";
import { page } from "../page";

it("Store set model", function () {
  const body = page.window.document.body;

  mount(body, Component, {});

  expect(body.children.length).toBe(1);
  expect(body.children[0].innerHTML).toBe("Hello m!");
  model?.addValue("n");
  expect(body.children.length).toBe(2);
  expect(body.children[0].innerHTML).toBe("Hello m!");
  expect(body.children[1].innerHTML).toBe("Hello n!");
  model?.addValue("o");
  expect(body.children.length).toBe(3);
  expect(body.children[0].innerHTML).toBe("Hello m!");
  expect(body.children[1].innerHTML).toBe("Hello n!");
  expect(body.children[2].innerHTML).toBe("Hello o!");
  model?.removeValue("n");
  expect(body.children.length).toBe(2);
  expect(body.children[0].innerHTML).toBe("Hello m!");
  expect(body.children[1].innerHTML).toBe("Hello o!");
});
