import { mount } from "vasille-web";
import { control, FieldStateTest } from "../../src/state/FieldStateTest";
import { page } from "../page";

it("dynamic component with reactive object", function () {
  const body = page.window.document.body;

  mount(body, FieldStateTest, {});

  expect(body.children.length).toBe(1);
  expect(body.children[0].innerHTML).toBe("Hello test!");
  control?.setValue("world");
  expect(body.children[0].innerHTML).toBe("Hello world!");
});
