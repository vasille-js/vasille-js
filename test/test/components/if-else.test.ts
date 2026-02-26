import { mount } from "steel-frame";
import { IfElseTest, control } from "../../src/components/IfElseTest";
import { page } from "../page";

it("Else component test", function () {
  const body = page.window.document.body;

  mount(body, IfElseTest, {});

  expect(body.children.length).toBe(1);
  expect(body.children[0].innerHTML).toBe("else");
  control.setValue("if");
  expect(body.children.length).toBe(1);
  expect(body.children[0].innerHTML).toBe("if");
  control.setValue("else");
  expect(body.children.length).toBe(1);
  expect(body.children[0].innerHTML).toBe("else");
});
