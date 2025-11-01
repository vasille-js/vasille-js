import { compose } from "vasille-web";

const C = compose(() => {
  let $a = 1;

  <>
    {$a < 1 && <>smaller then 1</>}
    {$a < 1 && $a < 2 && <>smaller then 2</>}
  </>;
});
