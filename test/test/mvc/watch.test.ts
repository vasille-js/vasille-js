import { mount } from "steel-frame";
import { WatchTest, control } from "../../src/mvc/WatchTest";
import { page } from "../page";

it("MVC watch call", function () {
  const body = page.window.document.body;

  mount(body, WatchTest, {});

  expect(body.children.length).toBe(1);
  expect(body.children[0].innerHTML).toBe("Hello +test!");
  control?.setValue("world");
  expect(body.children[0].innerHTML).toBe("Hello +world!");
});
