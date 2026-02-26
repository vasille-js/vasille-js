import { beforeMount, component, view } from "steel-frame";

export let control: { setValue(value: string): void } | undefined = undefined;

export const FieldStateTest = component(() => {
  const data = { $text: "test" };

  beforeMount(() => {
    control = {
      setValue(value: string) {
        data.$text = value;
      },
    };
  });

  <div>Hello {data.$text}!</div>;
});
