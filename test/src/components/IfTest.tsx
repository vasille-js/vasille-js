import { view, If, ref, component } from "vasille-web";

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
