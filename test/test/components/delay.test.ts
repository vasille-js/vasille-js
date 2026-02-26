import { mount } from "steel-frame";
import { DelayTest, control } from "../../src/components/DelayTest";
import { page } from "../page";

it("Delay component test", function (done) {
  const body = page.window.document.body;

  mount(body, DelayTest, {});

  expect(body.children.length).toBe(0);
  setTimeout(() => {
    expect(body.children.length).toBe(1);
    expect(body.children[0].innerHTML).toBe("test");
    control.setValue("Vasille");
    expect(body.children[0].innerHTML).toBe("Vasille");
    done();
  }, 10);
});
