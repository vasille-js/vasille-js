import { compose, backward } from "vasille-web";

const C1 = compose(({ $test }: { $test: string }) => {
  <>{$test}</>;
});

const C2 = compose(() => {
  <C1 $test={backward("2")} />;
});
