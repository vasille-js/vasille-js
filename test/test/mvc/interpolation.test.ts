import { mount } from "steel-frame";
import { control, InterpolationTest } from "../../src/mvc/InterpolationTest";
import { page } from "../page";

it("Interpolation of hybrid & MVVM", function () {
  const body = page.window.document.body;

  mount(body, InterpolationTest, {});

  expect(body.children.length).toBe(1);
  expect(body.children[0].innerHTML).toBe("10 to 12");
  control?.setRootValue(7);
  expect(body.children[0].innerHTML).toBe("7 to 12");
  control?.setModelValue(20);
  expect(body.children[0].innerHTML).toBe("7 to 20");
});
