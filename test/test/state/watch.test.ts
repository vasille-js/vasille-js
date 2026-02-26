import { mount } from "steel-frame";
import { WatchStateTest, control } from "../../src/state/WatchStateTest";
import { page } from "../page";

it("watch call in component", function () {
  const body = page.window.document.body;

  mount(body, WatchStateTest, {});

  expect(body.children.length).toBe(1);
  expect(body.children[0].innerHTML).toBe("Hello +test!");
  control?.setValue("world");
  expect(body.children[0].innerHTML).toBe("Hello +world!");
});
