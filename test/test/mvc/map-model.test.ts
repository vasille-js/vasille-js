import { mount } from "vasille-web";
import { control, Component } from "../../src/mvc/map-model";
import { page } from "../page";

it("MVC map model", function() {
  const body = page.window.document.body;

  mount(body, Component, {});

  expect(body.children.length).toBe(1);
  expect(body.children[0].innerHTML).toBe("Hello a!");
  control?.setValue(1, "b");
  expect(body.children.length).toBe(2);
  expect(body.children[0].innerHTML).toBe("Hello a!");
  expect(body.children[1].innerHTML).toBe("Hello b!");
  control?.setValue(2, "c");
  expect(body.children.length).toBe(3);
  expect(body.children[0].innerHTML).toBe("Hello a!");
  expect(body.children[1].innerHTML).toBe("Hello b!");
  expect(body.children[2].innerHTML).toBe("Hello c!");
  control?.setValue(1, "z");
  expect(body.children.length).toBe(3);
  expect(body.children[0].innerHTML).toBe("Hello a!");
  expect(body.children[1].innerHTML).toBe("Hello c!");
  expect(body.children[2].innerHTML).toBe("Hello z!");
})
