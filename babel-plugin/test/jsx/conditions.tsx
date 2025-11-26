import { compose, If, ElseIf, Else } from "steel-frame";

const C = compose(() => {
  let $condition = true;

  <If $condition={$condition}>if 1</If>;
  <If $condition={$condition} slot={() => <>if 2</>} />;

  <>
    <If $condition={$condition}>if 3</If>
    <Else>else 3</Else>
  </>;

  <>
    <If $condition={$condition} slot={() => <>if 4</>} />
    <Else slot={() => <>else 4</>} />
  </>;
  <>
    <If $condition={$condition}>if 5</If>
    <ElseIf $condition={$condition}>else if 5</ElseIf>
    <Else>else 5</Else>
  </>;

  <>
    <If $condition={$condition} slot={() => <>if 6</>} />
    <ElseIf $condition={$condition} slot={() => <>else if 6</>} />
    <Else slot={() => <>else 6</>} />
  </>;

  <>
    <If $condition={$condition}>if 7</If>
    <div />
  </>;

  <>
    <If $condition={$condition}>if 8</If>
    <Else />
    <div />
  </>;
});
