import { bridge, view, Watch } from "vasille-web";

const state = bridge.ref("test");

export const strings: string[] = [];
export const control = {
  setValue(value: string) {
    bridge.setValue(state, value);
  },
};

export const Component = view(() => {
  <Watch
    model={bridge.value(state)}
    slot={value => {
      strings.push(value);
      <div>{value}</div>;
    }}
  />;
});
