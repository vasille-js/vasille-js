import { mount } from "vasille-web";
import { control, SetModelTest } from "../../src/mvc/SetModelTest";
import { page } from "../page";

it("MVC set model", function () {
  const body = page.window.document.body;

  mount(body, SetModelTest, {});

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
