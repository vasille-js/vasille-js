import { bridge, view, Delay } from "vasille-web";

const state = bridge.ref("test");

export const control = {
  setValue(value: string) {
    bridge.setValue(state, value);
  }
};

export const Component = view(() => {
  <Delay time={1}>
    <div>{state}</div>
  </Delay>;
})
