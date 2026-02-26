import { mount } from "steel-frame";
import { control, CalculateStateTest } from "../../src/state/CalculateStateTest";
import { page } from "../page";

it("calculate call in component", function () {
  const body = page.window.document.body;

  mount(body, CalculateStateTest, {});

  expect(body.children.length).toBe(1);
  expect(body.children[0].innerHTML).toBe("Hello +test!");
  control?.setValue("world");
  expect(body.children[0].innerHTML).toBe("Hello +world!");
});
