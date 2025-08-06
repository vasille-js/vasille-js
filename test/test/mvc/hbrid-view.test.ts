import { mount } from "vasille-web";
import { control, Component } from "../../src/mvc/hybrid-view";
import { page } from "../page";

it("Hybrid view call", function() {
  const body = page.window.document.body;

  const app =mount(body, Component, {});

  expect(body.children.length).toBe(2);
  expect(body.children[0].innerHTML).toBe("1+10");
  expect(body.children[1].innerHTML).toBe("3+12");
  control?.setValue(2)
  expect(body.children[0].innerHTML).toBe("2+10");
  expect(body.children[1].innerHTML).toBe("4+12");
  control?.setInnerValue(20)
  expect(body.children[0].innerHTML).toBe("2+20");
  expect(body.children[1].innerHTML).toBe("4+22");
})
