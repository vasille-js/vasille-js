import {awaited, beforeMount, Debug, If, page} from "vasille-web";

export default page(async () => {
  const [$err, $data, reload] = awaited(() => {
    throw "sync";
  });

  beforeMount(() => {
    reload();
  });

  <If $condition={$err}>
    <Debug $model={$err}/>
    {$err}
  </If>;
  <>{$data}</>;
  <Debug $model={$data}/>;
});
