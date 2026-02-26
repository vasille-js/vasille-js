import { mount } from "steel-frame";
import { control, StoredTest } from "../../src/mvc/StoredTest";
import { page } from "../page";

it("MVC stored call", function () {
  const body = page.window.document.body;

  mount(body, StoredTest, {});

  expect(body.children.length).toBe(1);
  expect(body.children[0].innerHTML).toBe("Hello test!");
  control?.setValue("world");
  expect(body.children[0].innerHTML).toBe("Hello test!");
});
