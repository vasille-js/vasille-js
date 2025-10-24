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
