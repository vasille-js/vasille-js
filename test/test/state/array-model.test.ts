import { mount } from "vasille-web";
import { control, ArrayModelStateTest } from "../../src/state/ArrayModelStateTest";
import { page } from "../page";

it("array model in component", function () {
  const body = page.window.document.body;

  mount(body, ArrayModelStateTest, {});

  expect(body.children.length).toBe(1);
  expect(body.children[0].innerHTML).toBe("Hello x!");
  control?.addValue("y");
  expect(body.children.length).toBe(2);
  expect(body.children[0].innerHTML).toBe("Hello x!");
  expect(body.children[1].innerHTML).toBe("Hello y!");
  control?.addValue("z");
  expect(body.children.length).toBe(3);
  expect(body.children[0].innerHTML).toBe("Hello x!");
  expect(body.children[1].innerHTML).toBe("Hello y!");
  expect(body.children[2].innerHTML).toBe("Hello z!");
  control?.replaceValue(1, "a");
  expect(body.children.length).toBe(3);
  expect(body.children[0].innerHTML).toBe("Hello x!");
  expect(body.children[1].innerHTML).toBe("Hello a!");
  expect(body.children[2].innerHTML).toBe("Hello z!");
});
