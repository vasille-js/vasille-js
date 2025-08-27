import { mount } from "vasille-web";
import { control, RefStateTest } from "../../src/state/RefStateTest";
import { page } from "../page";

it("ref call in component", function () {
  const body = page.window.document.body;

  mount(body, RefStateTest, {});

  expect(body.children.length).toBe(1);
  expect(body.children[0].innerHTML).toBe("Hello test!");
  control?.setValue("world");
  expect(body.children[0].innerHTML).toBe("Hello world!");
});
