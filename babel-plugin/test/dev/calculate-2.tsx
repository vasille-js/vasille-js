import { calculate, component, ref } from "steel-frame";

let $a = ref(1);
const { $b } = calculate(() => {
  return { $b: $a + 1 };
});
