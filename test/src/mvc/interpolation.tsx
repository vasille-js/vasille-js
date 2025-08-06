import { BridgeValue, hybridView, bridge, view } from "vasille-web";

interface EndProps extends Props {
  model: number;
}

const EndComponent = view(({root, model}: EndProps) => {
  <div>{root} to {model}</div>
})

interface Models {
  model: { value: BridgeValue<number> }
}

interface Props {
  root: number;
}

const HybridComponent = hybridView(({model}: Models, {root}: Props) => {
  <EndComponent model={bridge.value(model.value)} root={root}/>
});

export let control: {
  setModelValue(value: number): void;
  setRootValue(value: number): void;
}|undefined = undefined

export const Component = view(() => {
  let root = 10;
  const model = bridge.ref(12);

  control = {
    setModelValue(value: number) {
      bridge.setValue(model, value)
    },
    setRootValue(value: number) {
      root = value;
    }
  };

  <HybridComponent model={{value: model}} root={root}/>;
});
