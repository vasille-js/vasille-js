import { mount } from "steel-frame";
import { IfTest, control } from "../../src/components/IfTest";
import { page } from "../page";

it("If component test", function () {
  const body = page.window.document.body;

  mount(body, IfTest, {});

  expect(body.children.length).toBe(0);
  control.setValue("if");
  expect(body.children.length).toBe(1);
  expect(body.children[0].innerHTML).toBe("if");
  control.setValue("else");
  expect(body.children.length).toBe(0);
});
