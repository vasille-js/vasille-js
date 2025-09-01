import { view, Debug, ref, component } from "vasille-web";

let $state = ref("test");

export const control = {
  setValue(value: string) {
    $state = value;
  },
};

export const DebugTest = component(() => {
  <Debug $model={$state} />;
});
