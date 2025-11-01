import { ref } from "vasille-web";
let $a = ref(0);
function copy(props) {
  return {
    $let: $a,
    $copy: props.$copy
  };
}
class C {
  constructor(props) {
    this.$copy = props.$copy;
    this.$a = $a;
  }
}
