import {mount} from "vasille-web";
import { Component, control } from "../../src/state/forward";
import { page } from "../page";

it("forward to embed component", function() {
  const body = page.window.document.body;

  mount(body, Component, {});

  expect(body.children.length).toBe(2);
  expect(body.children[0].innerHTML).toBe("Hello test!");
  expect(body.children[1].innerHTML).toBe("Embed test");
  control.setParentValue?.("world");
  expect(body.children[0].innerHTML).toBe("Hello world!");
  expect(body.children[1].innerHTML).toBe("Embed world");
  control.setChildValue?.("+");
  expect(body.children[0].innerHTML).toBe("Hello world!");
  expect(body.children[1].innerHTML).toBe("Embed +");
  control.setParentValue?.("*");
  expect(body.children[0].innerHTML).toBe("Hello *!");
  expect(body.children[1].innerHTML).toBe("Embed +");
})
