import { view } from "vasille-web";

export let control: { setValue(value: string): void } | undefined = undefined;

export const Component = view(() => {
  const data = { text: "test" };

  control = {
    setValue(value: string) {
      data.text = value;
    },
  };

  <div>Hello {data.text}!</div>;
});
