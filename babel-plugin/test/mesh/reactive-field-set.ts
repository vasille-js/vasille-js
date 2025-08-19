import { compose, ref } from "vasille-web";

let o1 = {
  $x: ref(1),
};

const o2 = {
  $x: ref(1),
};

const C = compose(() => {
  const o3 = {
    $x: 1,
  }

  o1.$x = 2;
  o2.$x = 2;
  o3.$x = 3;
})

