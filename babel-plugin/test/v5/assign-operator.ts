import { compose, watch } from "steel-frame";

interface Props {
  $a: number;
  $b: boolean;
}

const C = compose<Props>(props => {
  watch(() => {
    props.$a += 1;
    props.$a = 2;
  });

  function update() {
    props.$b &&= true;
    props.$b = false;
  }
});
