import { BridgeValue, hybridView, bridge, view } from "vasille-web";

interface Models {
  model: { value: BridgeValue<number> };
}

interface Props {
  number: number;
}

const HybridComponent = hybridView(({ model }: Models, { number }: Props) => {
  <div>
    {model.value}+{number}
  </div>;
  <div>
    {bridge.value(model.value) + 2}+{number + 2}
  </div>;
});

const value = bridge.ref(1);

export const control: {
  setValue(value: number): void;
  setInnerValue?(value: number): void;
} = {
  setValue(x: number) {
    bridge.setValue(value, x);
  },
};

export const Component = view(() => {
  let number = 10;

  control.setInnerValue = (value: number) => {
    number = value;
  };

  <HybridComponent model={{ value }} number={number} />;
});
