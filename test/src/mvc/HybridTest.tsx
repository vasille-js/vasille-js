import { beforeMount, component, ref } from "vasille-web";

interface Models {
  model: { $value: number };
}

interface Props {
  $number: number;
}

const HybridComponent = component(({ model, $number }: Models & Props) => {
  <div>
    {model.$value}+{$number}
  </div>;
  <div>
    {model.$value + 2}+{$number + 2}
  </div>;
});

let $value = ref(1);

export const control: {
  setValue(value: number): void;
  setInnerValue?(value: number): void;
} = {
  setValue(x: number) {
    $value = x;
  },
};

export const HybridTest = component(() => {
  let $number = 10;

  beforeMount(() => {
    control.setInnerValue = (value: number) => {
      $number = value;
    };
  });

  <HybridComponent model={{ $value: $value }} $number={$number} />;
});
