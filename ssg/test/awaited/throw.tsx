import { awaited, If, page } from "steel-frame";

export default page(async () => {
    const [$err, $data] = awaited(
        () =>
            new Promise(resolve => {
                throw 1;
            }),
    );

    <If $condition={$err}>{$err}</If>;
    <>{$data}</>;
});
