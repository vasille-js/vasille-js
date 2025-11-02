import { compose, prompt, safe as VasilleSafe } from "vasille-web";
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
const App = compose(Vasille => {
  VasilleSafe(() => {
    promptName(Vasille, {});
    promptWithRules(Vasille, {
      rules: ["x"]
    });
  })();
}, "App");
