import { mount } from "steel-frame";
import { control, RefTest } from "../../src/mvc/RefTest";
import { page } from "../page";

it("MVC ref call", function () {
  const body = page.window.document.body;

  mount(body, RefTest, {});

  expect(body.children.length).toBe(1);
  expect(body.children[0].innerHTML).toBe("Hello test!");
  control?.setValue("world");
  expect(body.children[0].innerHTML).toBe("Hello world!");
});
