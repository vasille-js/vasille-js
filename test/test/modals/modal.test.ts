import { page } from "../page";
import { mount } from "steel-frame";
import { TestModalApp } from "../../src/modals/TestModalApp";

it("Test Modal", function () {
  const body = page.window.document.body;

  mount(body, TestModalApp, {});

  expect(body.children.length).toBe(2);
  expect(body.children[0].className).toBe("root");
  expect(body.children[1].className).toBe("modal");
});
