import { component, ref } from "vasille-web";

const C = component(() => {
  // @ts-expect-error
  const $none = ref();
});
