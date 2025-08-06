import { mount } from "vasille-web";
import { Component, control, xes } from "../../src/components/slot";
import { page } from "../page";

it("Slot component test", function () {
  const body = page.window.document.body;

  mount(body, Component, {});

  xes.forEach((item, index) => {
    expect(item).toBe(index === 0 ? 0 : 3);
  });
  expect(body.children.length).toBe(4);
  expect(body.children[0].children.length).toBe(1);
  expect(body.children[0].children[0].innerHTML).toBe("slot 1 default");
  expect(body.children[1].children.length).toBe(2);
  expect(body.children[1].children[0].innerHTML).toBe("child");
  expect(body.children[1].children[1].innerHTML).toBe("slot 1 default");
  expect(body.children[2].children.length).toBe(1);
  expect(body.children[2].children[0].innerHTML).toBe("child0");
  expect(body.children[3].children.length).toBe(2);
  expect(body.children[3].children[0].innerHTML).toBe("slot 1 default");
  expect(body.children[3].children[1].innerHTML).toBe("child3");
  control?.setX(1);
  expect(body.children[2].children[0].innerHTML).toBe("child1");
});
