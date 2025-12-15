import { compose, raw, ref, watch } from "vasille-web";

let state = {
  $value: ref(1),
};

const list = raw([0]);

const C = compose(() => {
  const index = raw(0);

  watch(() => {
    state.$value += 2;
    list[index] += 3;
  });
});
