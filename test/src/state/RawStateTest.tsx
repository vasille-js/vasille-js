import { beforeMount, component, raw, view } from "vasille-web";

export let control: { setValue(value: string): void } | undefined = undefined;

export const RawStateTest = component(() => {
  let $r = "test";
  const text = raw($r);

  beforeMount(() => {
    control = {
      setValue(value: string) {
        $r = value;
      },
    };
  });

  <div>Hello {text}!</div>;
});
