import { compose, If } from "vasille-web";

const C = compose(() => {
  <If {...{ $condition: true }} />;
});
