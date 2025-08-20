import { compose } from "vasille-web";

let c = "c";

const C = compose(() => {
  let $a = "a";
  let $b = false;

  <div class={["static1", "static2"]} />;
  <div class={[$a]} />;
  <div class={[$a === "b" && "aIsB"]} />;
  <div class={[c === "b" && "cIsB"]} />;
  <div class={[c]} />;
  <div class={[{ hover: true, ["b"]: $b, ...{ active: true } }]} />;
  <div class={[...[$a]]} />;
  <div class="a b" />;
  <div class={"a b"} />;
  <div class={`${$a} b`} />;
  <div class={`${"a"} b`} />;
  <div class={$a} />;
});
