import { calculate, component, ref } from "vasille-web";

let $a = ref(1);
const { $b } = calculate(() => {
  return { $b: $a + 1 };
});
