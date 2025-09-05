import {awaited, If, page} from "vasille-web";

export default page(async () => {
  const [$err, $data] = awaited(() => new Promise(resolve => resolve(1)));

  <div>
    <div>
      <If $condition={$data}>
        <div>{$data}</div>
      </If>
    </div>
    <div>{$data}</div>
  </div>;
});
