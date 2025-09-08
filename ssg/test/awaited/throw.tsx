import { awaited, Debug, If, page } from "vasille-web";

export default page(async () => {
    const [$err, $data] = awaited(
        () =>
            new Promise(resolve => {
                throw 1;
            }),
    );

    <If $condition={$err}>
        <Debug $model={$err} />
        {$err}
    </If>;
    <Debug $model={$data} />;
    <>{$data}</>;
});
