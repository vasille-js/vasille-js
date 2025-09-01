import { forward, component, beforeMount } from "vasille-web";

export const control: {
  setParentValue?(value: string): void;
  setChildValue?(value: string): void;
} = {};

const Embed = component(({ $text }: { $text: string }) => {
  beforeMount(() => {
    control.setChildValue = value => {
      $text = value;
    };
  });

  <div>Embed {$text}</div>;
});

export const ForwardStateTest = component(() => {
  let $text = "test";

  beforeMount(() => {
    control.setParentValue = value => {
      $text = value;
    };
  });

  <div>Hello {$text}!</div>;
  <Embed $text={forward($text)} />;
});
