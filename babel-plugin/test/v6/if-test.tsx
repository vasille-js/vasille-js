import { compose, Else, ElseIf, If } from "steel-frame";

const C = compose(() => {
  <>
    <If $condition={1}>1</If>
    <ElseIf $condition={2}>2</ElseIf>
    <Else>3</Else>
    <If $condition={1}>1</If>
    <ElseIf $condition={2}>2</ElseIf>
    <If $condition={1}>1</If>
    {1 ? <>1</> : <>2</>}
    {1 && <>3</>}
  </>;
});
