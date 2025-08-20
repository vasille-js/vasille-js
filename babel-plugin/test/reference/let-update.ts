import { compose } from "vasille-web";

const C = compose(() => {
  let $count = 1;

  function inc() {
    $count += 1;
    $count = $count + 1;
    $count = parseInt($count.toFixed(0));
  }
});
