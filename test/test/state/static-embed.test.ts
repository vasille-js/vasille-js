import {mount} from "vasille-web";
import { Component } from "../../src/state/static-embed";
import { page } from "../page";

it("static embed component", function() {
  const body = page.window.document.body;

  mount(body, Component, {});

  expect(body.children.length).toBe(2);
  expect(body.children[0].innerHTML).toBe("Hello world!");
  expect(body.children[1].innerHTML).toBe("Embed");
})
