import { mount } from "vasille-web";
import { model, Component } from "../../src/store/bind";
import { page } from "../page";

it("Store bind expression", function () {
  const body = page.window.document.body;

  mount(body, Component, {});

  expect(body.children.length).toBe(1);
  expect(body.children[0].innerHTML).toBe("Hello +test!");
  model?.setValue("world");
  expect(body.children[0].innerHTML).toBe("Hello +world!");
});
