import { ref } from "vasille-web";

interface Props {
  $copy: number;
}

let $a = ref(0);

function copy(props: Props) {
  return {
    $let: $a,
    $copy: props.$copy,
  };
}

class C {
  $copy: number;
  $a: number;

  public constructor(props: Props) {
    this.$copy = props.$copy;
    this.$a = $a;
  }
}
