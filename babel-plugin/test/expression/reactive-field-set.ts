import { compose, raw, ref, unwrap, watch } from "steel-frame";

let o1 = {
  $x: ref(1),
};

const o2 = {
  $x: ref(1),
};

const C = compose(() => {
  const arr = raw([0, 1]);
  let index = unwrap(0);

  const o3 = {
    $x: 1,
  };

  watch(() => {
    o1.$x = 2;
    o2.$x = 2;
    o3.$x = 3;
    arr[0] = 1;
    arr[index] = 2;
    arr["1"] = 3;
    o3["$x"] = 4;
  });
});
