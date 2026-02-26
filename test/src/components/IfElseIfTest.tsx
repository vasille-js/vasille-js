import { view, If, ElseIf, Else, ref, component } from "steel-frame";

let $state = ref("test");

export const control = {
  setValue(value: string) {
    $state = value;
  },
};

export const IfElseIfTest = component(() => {
  <>
    <If $condition={$state === "if"}>
      <div>if</div>
    </If>
    <ElseIf $condition={$state === "else-if"}>
      <div>else-if</div>
    </ElseIf>
    <Else>
      <div>else</div>
    </Else>
  </>;
});
