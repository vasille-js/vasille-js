import { compose } from "vasille-web";

const C1 = compose((props: { bool: boolean; $bool: boolean }) => {});

const C2 = compose(() => {
  <C1 bool $bool />;
});
