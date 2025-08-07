import { mount } from "vasille-web";
import { Watch, model } from "../../src/store/watch";
import { page } from "../page";

it("Store watch call", function () {
  const body = page.window.document.body;

  mount(body, Watch, {});

  expect(body.children.length).toBe(1);
  expect(body.children[0].innerHTML).toBe("Hello +test!");
  model?.setValue("world");
  expect(body.children[0].innerHTML).toBe("Hello +world!");
});
