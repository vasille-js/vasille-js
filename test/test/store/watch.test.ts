import { mount } from "steel-frame";
import { x } from "../../src/store/watch";
import { page } from "../page";

it("Store watch call", function () {
  const body = page.window.document.body;

  mount(body, x.Watch, {});

  expect(body.children.length).toBe(1);
  expect(body.children[0].innerHTML).toBe("Hello +test!");
  x.model?.setValue("world");
  expect(body.children[0].innerHTML).toBe("Hello +world!");
});
