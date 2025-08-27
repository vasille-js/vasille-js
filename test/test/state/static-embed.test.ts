import { mount } from "vasille-web";
import { StaticEmbedStateTest } from "../../src/state/StaticEmbedStateTest";
import { page } from "../page";

it("static embed component", function () {
  const body = page.window.document.body;

  mount(body, StaticEmbedStateTest, {});

  expect(body.children.length).toBe(2);
  expect(body.children[0].innerHTML).toBe("Hello world!");
  expect(body.children[1].innerHTML).toBe("Embed");
});
