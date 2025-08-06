import { mount } from "vasille-web";
import { Component, control, strings } from "../../src/components/watch";
import { page } from "../page";

it("Watch component test", function () {
  const body = page.window.document.body;

  mount(body, Component, {});

  expect(body.children.length).toBe(1);
  expect(body.children[0].innerHTML).toBe("test");
  expect(strings).toStrictEqual(["test"]);
  control.setValue("watch");
  expect(body.children.length).toBe(1);
  expect(body.children[0].innerHTML).toBe("watch");
  expect(strings).toStrictEqual(["test", "watch"]);
});
