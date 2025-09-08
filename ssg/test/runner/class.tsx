import { page } from "vasille-web";

export default page(async () => {
    let $state = "$state";
    let $bool = true;

    <div
        class={[
            $state,
            "class1",
            {
                $bool: $bool,
                missing: false,
            },
        ]}
    />;
});
