import { component, prompt } from "steel-frame";

const promptName = prompt(() => {});

const C = component(() => {
  <button onclick={() => promptName({})}>Prompt Name</button>;
});
