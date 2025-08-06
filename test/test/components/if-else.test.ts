import { mount } from "vasille-web";
import { Component, control } from "../../src/components/if-else";
import { page } from "../page";

it("Else component test", function () {
  const body = page.window.document.body;

  mount(body, Component, {});

  expect(body.children.length).toBe(1);
  expect(body.children[0].innerHTML).toBe("else");
  control.setValue("if");
  expect(body.children.length).toBe(1);
  expect(body.children[0].innerHTML).toBe("if");
  control.setValue("else");
  expect(body.children.length).toBe(1);
  expect(body.children[0].innerHTML).toBe("else");
});
