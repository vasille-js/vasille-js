import { mount } from "vasille-web";
import { Component, control } from "../../src/components/delay";
import { page } from "../page";

it("Delay component test", function (done) {
  const body = page.window.document.body;

  mount(body, Component, {});

  expect(body.children.length).toBe(0);
  setTimeout(() => {
    expect(body.children.length).toBe(1);
    expect(body.children[0].innerHTML).toBe("test");
    control.setValue("Vasille");
    expect(body.children[0].innerHTML).toBe("Vasille");
    done();
  }, 10);
});
