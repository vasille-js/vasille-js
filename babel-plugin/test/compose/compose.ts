import { component, compose, ref } from "steel-frame";

const C = compose(() => {
  let $a = 2;

  return { $a };
});

const C2 = component((props: { $a: number }) => {});

C({
  callback(data) {
    data.$a satisfies number;
  },
});

C2({
  $a: ref(1),
  // @ts-expect-error
  callback: () => void 0,
});
