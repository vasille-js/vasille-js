import { bridge, view, If } from "vasille-web";

const state = bridge.ref("test");

export const control = {
  setValue(value: string) {
    bridge.setValue(state, value);
  }
};

export const Component = view(() => {
  <If condition={bridge.value(state) === "if"}>
    <div>{state}</div>
  </If>;
})
