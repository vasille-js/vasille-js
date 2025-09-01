import { view, Delay, ref, component } from "vasille-web";

let $state = ref("test");

export const control = {
  setValue(value: string) {
    $state = value;
  },
};

export const DelayTest = component(() => {
  <Delay time={1}>
    <div>{$state}</div>
  </Delay>;
});
