import { view, If, Else, ref, component } from "vasille-web";

let $state = ref("test");

export const control = {
  setValue(value: string) {
    $state = value;
  },
};

export const IfElseTest = component(() => {
  <>
    <If $condition={$state === "if"}>
      <div>if</div>
    </If>
    <Else>
      <div>else</div>
    </Else>
  </>;
});
