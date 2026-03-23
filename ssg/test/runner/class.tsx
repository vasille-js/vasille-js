import { page } from "steel-frame";

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
