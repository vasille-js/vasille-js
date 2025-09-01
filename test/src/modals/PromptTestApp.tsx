import { beforeMount, component, prompt } from "vasille-web";

let _resolve: ((v: string) => void) | null = null;
let _reject: ((v: unknown) => void) | null = null;

export function resolvePrompt(value: string) {
  _resolve?.(value);
}

export function rejectPrompt(error: string) {
  _reject?.(error);
}

const promptName = prompt<string>(({reject, resolve}) => {
  beforeMount(() => {
    _resolve = resolve;
    _reject = reject;
  });

  <div class="prompt"></div>
});

export let control: {
  prompt(): Promise<string>;
}|null = null;

export const PromptTestApp = component(() => {
  beforeMount(() => {
    control = {
      prompt(): Promise<string> {
        return promptName({});
      },
    };
  });

  <div class="app"></div>
})
