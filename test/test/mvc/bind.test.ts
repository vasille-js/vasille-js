import { mount } from "steel-frame";
import { control, BindTest } from "../../src/mvc/BindTest";
import { page } from "../page";

it("MVC bind expression", function () {
  const body = page.window.document.body;

  mount(body, BindTest, {});

  expect(body.children.length).toBe(1);
  expect(body.children[0].innerHTML).toBe("Hello +test!");
  control?.setValue("world");
  expect(body.children[0].innerHTML).toBe("Hello +world!");
});
