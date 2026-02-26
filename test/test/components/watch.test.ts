import { mount } from "steel-frame";
import { WatchTest, control, strings } from "../../src/components/WatchTest";
import { page } from "../page";

it("WatchStore component test", function () {
  const body = page.window.document.body;

  mount(body, WatchTest, {});

  expect(body.children.length).toBe(1);
  expect(body.children[0].innerHTML).toBe("test");
  expect(strings).toStrictEqual(["test"]);
  control.setValue("watch");
  expect(body.children.length).toBe(1);
  expect(body.children[0].innerHTML).toBe("watch");
  expect(strings).toStrictEqual(["test", "watch"]);
});
