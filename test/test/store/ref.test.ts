import { mount } from "vasille-web";
import { x } from "../../src/store/ref";
import { page } from "../page";

it("Store ref call", function () {
  const body = page.window.document.body;

  mount(body, x.Component, {});

  expect(body.children.length).toBe(1);
  expect(body.children[0].innerHTML).toBe("Hello test!");
  x.model?.setValue("world");
  expect(body.children[0].innerHTML).toBe("Hello world!");
});
