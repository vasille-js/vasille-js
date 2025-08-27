import { mount } from "vasille-web";
import { IfElseIfTest, control } from "../../src/components/IfElseIfTest";
import { page } from "../page";

it("ElseIf component test", function () {
  const body = page.window.document.body;

  mount(body, IfElseIfTest, {});

  expect(body.children.length).toBe(1);
  expect(body.children[0].innerHTML).toBe("else");
  control.setValue("if");
  expect(body.children.length).toBe(1);
  expect(body.children[0].innerHTML).toBe("if");
  control.setValue("else-if");
  expect(body.children.length).toBe(1);
  expect(body.children[0].innerHTML).toBe("else-if");
});
