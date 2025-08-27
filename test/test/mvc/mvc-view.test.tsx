import { mount } from "vasille-web";
import { control, MvcViewTest } from "../../src/mvc/MvcViewTest";
import { page } from "../page";

it("MVC view call", function () {
  const body = page.window.document.body;

  const app = mount(body, MvcViewTest, {});

  expect(body.children.length).toBe(2);
  expect(body.children[0].innerHTML).toBe("1");
  expect(body.children[1].innerHTML).toBe("3");
  control?.setValue(2);
  expect(body.children[0].innerHTML).toBe("2");
  expect(body.children[1].innerHTML).toBe("4");
});
