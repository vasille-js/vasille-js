import { BridgeValue, mvcView, bridge, view } from "vasille-web";

interface Models {
  model: { value: BridgeValue<number> };
}

const MvcComponent = mvcView(({ model }: Models) => {
  <div>{model.value}</div>;
  <div>{bridge.value(model.value) + 2}</div>;
});

const value = bridge.ref(1);

export const control = {
  setValue(x: number) {
    bridge.setValue(value, x);
  },
};

export const Component = view(() => {
  <MvcComponent model={{ value }} />;
});
