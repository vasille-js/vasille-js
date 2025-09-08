import { awaited, Debug, If, page } from "vasille-web";

export default page(async () => {
    const [$err, $data] = awaited(() => new Promise(resolve => resolve(1)));

    <If $condition={$data}>
        <Debug $model={$data} />
    </If>;
    <Debug $model={$data} />;
});
