import { component, ref } from "vasille-web";

const C = component(() => {
  let $a = 1;
  const o = { $a: 1, c: 2 };

  function update(a: number) {
    $a = a;
    o.$a = a;
    o.c = 3;
  }
});

let $b = ref(1);
const obj = {
  $r: ref(1),
  x: 2,
};

function update1(a: number) {
  $b = a;
  obj.$r = 2;
  obj.x = 3;
}
