import { mount } from "vasille-web";
import { StaticStateTest } from "../../src/state/StaticStateTest";
import { page } from "../page";

it("static component", function () {
  const body = page.window.document.body;

  mount(body, StaticStateTest, {});

  expect(body.children.length).toBe(1);
  expect(body.children[0].innerHTML).toBe("Hello world!");
});
