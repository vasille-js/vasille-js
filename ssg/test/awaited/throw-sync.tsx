import { awaited, beforeMount, If, page } from "steel-frame";

export default page(async () => {
    const [$err, $data, reload] = awaited(() => {
        throw "sync";
    });

    beforeMount(() => {
        reload();
    });

    <If $condition={$err}>{$err}</If>;
    <>{$data}</>;
});
