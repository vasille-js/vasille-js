import { component, view } from "vasille-web";

const Embed = component(() => {
  <div>Embed</div>;
});

export const StaticEmbedStateTest = component(() => {
  <div>Hello world!</div>;
  <Embed />;
});
