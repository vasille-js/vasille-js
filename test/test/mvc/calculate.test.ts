import { mount } from "steel-frame";
import { control, CalculateTest } from "../../src/mvc/CalculateTest";
import { page } from "../page";

it("MVC calculate call", function () {
  const body = page.window.document.body;

  mount(body, CalculateTest, {});

  expect(body.children.length).toBe(1);
  expect(body.children[0].innerHTML).toBe("Hello +test!");
  control?.setValue("world");
  expect(body.children[0].innerHTML).toBe("Hello +world!");
});
