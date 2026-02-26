import { view, If, ref, component } from "steel-frame";

let $state = ref("test");

export const control = {
  setValue(value: string) {
    $state = value;
  },
};

export const IfTest = component(() => {
  <If $condition={$state === "if"}>
    <div>{$state}</div>
  </If>;
});
