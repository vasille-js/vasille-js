import { component, ref } from "vasille-web";

const C = component(() => {
  let $a = 0;

  return { $a };
});

const C2 = component((props: { $a: number; slot?(): void }) => {});

C({
  callback(data) {
    data.$a satisfies number;
  },
  // @ts-expect-error
  slot() {},
});

C2({
  $a: ref(1),
  slot: 2,
});
