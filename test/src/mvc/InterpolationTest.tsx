import { beforeMount, component, ref } from "steel-frame";

interface EndProps extends Props {
  $model: number;
}

const EndComponent = component(({ $root, $model }: EndProps) => {
  <div>
    {$root} to {$model}
  </div>;
});

interface Models {
  model: { $value: number };
}

interface Props {
  $root: number;
}

const HybridComponent = component(({ model, $root }: Models & Props) => {
  <EndComponent $model={model.$value} $root={$root} />;
});

export let control:
  | {
      setModelValue(value: number): void;
      setRootValue(value: number): void;
    }
  | undefined = undefined;

export const InterpolationTest = component(() => {
  let $root = 10;
  let $model = ref(12);

  beforeMount(() => {
    control = {
      setModelValue(value: number) {
        $model = value;
      },
      setRootValue(value: number) {
        $root = value;
      },
    };
  });

  <HybridComponent model={{ $value: $model }} $root={$root} />;
});
