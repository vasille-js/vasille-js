import { compose } from "vasille-dx";

export const C = compose(() => {
  let a = "text";

  <>
    text text2
    <></>
    {"text"}
    {a}
    <></>
    <div />
    text3
  </>;
  <></>;
});
