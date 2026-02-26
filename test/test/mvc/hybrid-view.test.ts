import { mount } from "steel-frame";
import { control, HybridTest } from "../../src/mvc/HybridTest";
import { page } from "../page";

it("Hybrid view call", function () {
  const body = page.window.document.body;

  mount(body, HybridTest, {});

  expect(body.children.length).toBe(2);
  expect(body.children[0].innerHTML).toBe("1+10");
  expect(body.children[1].innerHTML).toBe("3+12");
  control?.setValue(2);
  expect(body.children[0].innerHTML).toBe("2+10");
  expect(body.children[1].innerHTML).toBe("4+12");
  control?.setInnerValue?.(20);
  expect(body.children[0].innerHTML).toBe("2+20");
  expect(body.children[1].innerHTML).toBe("4+22");
});
