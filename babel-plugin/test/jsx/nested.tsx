import { compose, If } from "vasille-web";

interface Props {
  $bool?: boolean;
  $a?: number;
  $b?: number;
  $c?: string;
  str?: string;
  slot?(): void;
}

const C1 = compose((props: Props) => {
  <div />;
});

const C2 = compose(() => {
  let $a = 1;

  <div>
    <C1 $bool $a={1} $b={2} $c="text" str="str">
      {() => {
        <C1 {...{ $a: 1 }} $b={$a + 1} $bool={true}>
          <div />
          <span>1</span>
        </C1>;
      }}
    </C1>
  </div>;
  <C1
    slot={() => {
      <C1 />;
    }}
  />;
  <If $condition={$a > 1}>
    <C1 />
  </If>;
});
