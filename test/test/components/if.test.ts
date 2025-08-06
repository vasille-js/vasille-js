import { mount } from "vasille-web";
import { Component, control } from "../../src/components/if";
import { page } from "../page";

it("If component test", function () {
  const body = page.window.document.body;

  mount(body, Component, {});

  expect(body.children.length).toBe(0);
  control.setValue("if");
  expect(body.children.length).toBe(1);
  expect(body.children[0].innerHTML).toBe("if");
  control.setValue("else");
  expect(body.children.length).toBe(0);
});
