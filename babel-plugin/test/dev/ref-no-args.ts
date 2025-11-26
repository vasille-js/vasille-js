import { component, ref } from "steel-frame";

const C = component(() => {
  // @ts-expect-error
  const $none = ref();
});
