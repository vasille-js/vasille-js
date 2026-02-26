import { component, view } from "steel-frame";

const Embed = component(() => {
  <div>Embed</div>;
});

export const StaticEmbedStateTest = component(() => {
  <div>Hello world!</div>;
  <Embed />;
});
