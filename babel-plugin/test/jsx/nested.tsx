import { compose } from "vasille-dx";

export const C1 = compose((props: {
  bool?: boolean;
  a?: number;
  b?: number;
  slot?(): void;
}) => {
  <div />;
});

export const C2 = compose(() => {
  let a = 1;

  <div>
    <C1 bool a={1} b={2}>
      {() => {
        <C1 {...{a: 1}} b={a + 1} bool={true}>
          <div/>
          <span>1</span>
        </C1>
      }}
    </C1>
  </div>;
  <C1 slot={() => {
    <C1 />;
  }}/>
});
