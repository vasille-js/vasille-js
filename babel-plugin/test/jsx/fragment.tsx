import { compose } from "vasille-web";

const C = compose(() => {
  let $a = "text";

  <>
    text text2
    <></>
    <>{"text"}</>
    <>{$a}</>
    <div />
    text3
  </>;
  <></>;
});
