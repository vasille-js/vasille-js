import { compose, backward } from "vasille-web";

const C1 = compose(({ $test }: { $test: string }) => {
  <>{$test}</>;
});

const C2 = compose(() => {
  let $test = "2";
  let obj = { $test: "3" };

  <C1 $test={backward($test)} />;
  <C2 $test={backward(obj.$test)} />;
});
