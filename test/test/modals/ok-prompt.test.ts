import { page } from "../page";
import { mount } from "vasille-web";
import { PromptTestApp, resolvePrompt, control } from "../../src/modals/PromptTestApp";

it("Prompt test", async function() {
  const body = page.window.document.body;

  mount(body, PromptTestApp, {});
  expect(body.children.length).toBe(1);
  expect(body.children[0].className).toBe("app");

  setTimeout(() => {
    expect(body.children.length).toBe(2);
    expect(body.children[1].className).toBe("prompt");
    resolvePrompt("ok");
  });
  expect(await control?.prompt()).toBe("ok");
});
