import { beforeMount, compose, prompt, PromptProps } from "vasille-web";

const promptName = prompt<string>(props => {
  function save() {
    props.resolve("x");
    props.reject(new Error("x"));
  }
});

interface Props extends PromptProps<string> {
  rules: string[];
}

const promptWithRules = prompt<string, Props>(props => {
  function save() {
    props.resolve(props.rules[0]);
  }
});

const App = compose(() => {
  beforeMount(() => {
    promptName({}) satisfies Promise<string>;
    promptWithRules({ rules: ["x"] }) satisfies Promise<string>;
  });
});
