import { compose, forward } from "vasille-web";

const C1 = compose(({ $test }: { $test: string }) => {
  <>{$test}</>;
});

const C2 = compose(() => {
  let $test = "2";
  let obj = { $test: "3" };

  <C1 $test={forward($test)} />;
  <C2 $test={forward(obj.$test)} />;
});
