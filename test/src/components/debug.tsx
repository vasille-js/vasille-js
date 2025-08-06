import { bridge, view, Debug } from "vasille-web";

const state = bridge.ref("test");

export const control = {
  setValue(value: string) {
    bridge.setValue(state, value);
  }
};

export const Component = view(() => {
  <Debug model={state} />
})
