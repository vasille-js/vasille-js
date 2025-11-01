import { compose } from "vasille-web";

const C = compose(() => {
  let $a = 1;

  <>
    {$a < 1 ? <>smaller then 1</> : $a > 2 && <>bigger then 2</>}
    {$a < 1 ? $a < -1 && <>smaler then -1 & 1</> : <>bigger then 2</>}
    {$a < 1 &&
      ($a < -10 ? (
        <>smaller then -10 & 1</>
      ) : (
        <>
          <>bigger then -10</>
          <>smaller then 1</>
        </>
      ))}
  </>;
});
