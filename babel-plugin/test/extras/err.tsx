import { calculate, compose, ref } from "steel-frame";

const c = compose(() => {
  const $b = calculate(() => {
    <div>1</div>;
    return 1;
  });
  const $c = calculate(() => {
    <>1</>;
    return 1;
  });
  let d = ref(2);
  if (d) {
    console.log(d);
  }
});

function x() {
  <div>1</div>;
}
function y() {
  <>1</>;
}
