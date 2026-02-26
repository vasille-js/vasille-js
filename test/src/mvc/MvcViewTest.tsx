import { component, ref } from "steel-frame";

interface Models {
  model: { $value: number };
}

const MvcComponent = component(({ model }: Models) => {
  <div>{model.$value}</div>;
  <div>{model.$value + 2}</div>;
});

let $value = ref(1);

export const control = {
  setValue(x: number) {
    $value = x;
  },
};

export const MvcViewTest = component(() => {
  <MvcComponent model={{ $value }} />;
});
