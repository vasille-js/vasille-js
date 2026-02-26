import { mount } from "steel-frame";
import { x } from "../../src/store/array-model";
import { page } from "../page";

it("Store array model", function () {
  const body = page.window.document.body;

  mount(body, x.Component, {});

  expect(body.children.length).toBe(1);
  expect(body.children[0].innerHTML).toBe("Hello x!");
  x.model?.addValue("y");
  expect(body.children.length).toBe(2);
  expect(body.children[0].innerHTML).toBe("Hello x!");
  expect(body.children[1].innerHTML).toBe("Hello y!");
  x.model?.addValue("z");
  expect(body.children.length).toBe(3);
  expect(body.children[0].innerHTML).toBe("Hello x!");
  expect(body.children[1].innerHTML).toBe("Hello y!");
  expect(body.children[2].innerHTML).toBe("Hello z!");
  x.model?.replaceValue(1, "a");
  expect(body.children.length).toBe(3);
  expect(body.children[0].innerHTML).toBe("Hello x!");
  expect(body.children[1].innerHTML).toBe("Hello a!");
  expect(body.children[2].innerHTML).toBe("Hello z!");
});
