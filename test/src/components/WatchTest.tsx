import { beforeMount, component, ref, view, Watch } from "steel-frame";

let $state = ref("test");

export const strings: string[] = [];
export const control = {
  setValue(value: string) {
    $state = value;
  },
};

export const WatchTest = component(() => {
  <Watch
    $model={$state}
    slot={value => {
      beforeMount(() => {
        strings.push(value);
      });
      <div>{value}</div>;
    }}
  />;
});
