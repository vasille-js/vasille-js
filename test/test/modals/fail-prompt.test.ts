import { page } from "../page";
import { mount } from "steel-frame";
import { PromptTestApp, rejectPrompt, control } from "../../src/modals/PromptTestApp";

it("Prompt test", async function () {
  const body = page.window.document.body;

  mount(body, PromptTestApp, {});
  expect(body.children.length).toBe(1);
  expect(body.children[0].className).toBe("app");

  setTimeout(() => {
    expect(body.children.length).toBe(2);
    expect(body.children[1].className).toBe("prompt");
    rejectPrompt("test fail error");
  });
  await expect(control?.prompt()).rejects.toBe("test fail error");
});
