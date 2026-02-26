import { mount } from "steel-frame";
import { x } from "../../src/store/set-model";
import { page } from "../page";

it("Store set model", function () {
  const body = page.window.document.body;

  mount(body, x.Component, {});

  expect(body.children.length).toBe(1);
  expect(body.children[0].innerHTML).toBe("Hello m!");
  x.model?.addValue("n");
  expect(body.children.length).toBe(2);
  expect(body.children[0].innerHTML).toBe("Hello m!");
  expect(body.children[1].innerHTML).toBe("Hello n!");
  x.model?.addValue("o");
  expect(body.children.length).toBe(3);
  expect(body.children[0].innerHTML).toBe("Hello m!");
  expect(body.children[1].innerHTML).toBe("Hello n!");
  expect(body.children[2].innerHTML).toBe("Hello o!");
  x.model?.removeValue("n");
  expect(body.children.length).toBe(2);
  expect(body.children[0].innerHTML).toBe("Hello m!");
  expect(body.children[1].innerHTML).toBe("Hello o!");
});
