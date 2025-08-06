import { bridge, view, If, ElseIf, Else } from "vasille-web";

const state = bridge.ref("test");

export const control = {
  setValue(value: string) {
    bridge.setValue(state, value);
  },
};

export const Component = view(() => {
  <If condition={bridge.value(state) === "if"}>
    <div>if</div>
  </If>;
  <ElseIf condition={bridge.value(state) === "else-if"}>
    <div>else-if</div>
  </ElseIf>;
  <Else>
    <div>else</div>
  </Else>;
});
