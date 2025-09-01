import { mount } from "vasille-web";
import { control, RawStateTest } from "../../src/state/RawStateTest";
import { page } from "../page";

it("value call in component", function () {
  const body = page.window.document.body;

  mount(body, RawStateTest, {});

  expect(body.children.length).toBe(1);
  expect(body.children[0].innerHTML).toBe("Hello test!");
  control?.setValue("world");
  expect(body.children[0].innerHTML).toBe("Hello test!");
});
