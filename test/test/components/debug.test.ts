import { mount } from "vasille-web";
import { Component, control } from "../../src/components/debug";
import { page } from "../page";

it("Debug component test", function () {
  const body = page.window.document.body;

  mount(body, Component, {});

  expect(body.childNodes.length).toBe(2);
  expect(body.childNodes[1]).toBeInstanceOf(page.window.Comment);
  // @ts-ignore
  expect((body.childNodes[1] as page.window.Comment).textContent).toBe("test");
  control.setValue("Vasille");
  // @ts-ignore
  expect((body.childNodes[1] as page.window.Comment).textContent).toBe("Vasille");
});
