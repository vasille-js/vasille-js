import { mount } from "steel-frame";
import { AwaitedTest, reloads, c2states, c1states } from "../../src/components/AwaitedTest";
import { page } from "../page";

it("awaited function test", function (done) {
  const body = page.window.document.body;

  mount(body, AwaitedTest, {});

  expect(body.children.length).toBe(0);
  expect(c1states).toStrictEqual([[undefined, undefined]]);
  expect(c2states).toStrictEqual([[undefined, undefined]]);
  setTimeout(() => {
    expect(c1states).toStrictEqual([
      [undefined, undefined],
      [undefined, 0],
    ]);
    expect(c2states).toStrictEqual([
      [undefined, undefined],
      [0, undefined],
    ]);
    reloads.forEach(reload => reload());
    setTimeout(() => {
      expect(c1states).toStrictEqual([
        [undefined, undefined],
        [undefined, 0],
        [undefined, undefined],
        [1, undefined],
      ]);
      expect(c2states).toStrictEqual([
        [undefined, undefined],
        [0, undefined],
        [undefined, undefined],
        [undefined, 1],
      ]);
      done();
    });
  });
});
