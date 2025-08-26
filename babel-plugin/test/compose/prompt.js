import { prompt } from "vasille-web";
const promptName = prompt((Vasille, props) => {
  function save() {
    props.resolve("x");
    props.reject(new Error("x"));
  }
}, "promptName");
const promptWithRules = prompt((Vasille, props) => {
  function save() {
    props.resolve(props.rules[0]);
  }
}, "promptWithRules");
promptName({});
promptWithRules({
  rules: ["x"]
});
