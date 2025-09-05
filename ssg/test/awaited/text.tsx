import {awaited, If, page} from "vasille-web";

export default page(async () => {
  const [$err, $data] = awaited(() => new Promise(resolve => resolve(1)));

  <If $condition={$data}>
    {$data}
  </If>;
  <>{$data}</>;
});
