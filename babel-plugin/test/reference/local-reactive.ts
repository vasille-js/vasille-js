import { compose, raw, ref } from "steel-frame";

const C = compose(() => {
  const $arr = ref([{ $a: 1 }, { $a: 2 }, { $a: 3 }]);
  const $first = $arr.find(item => raw(item.$a) > 1);
});
