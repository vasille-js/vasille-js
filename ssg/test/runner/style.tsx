import { page, ref } from "steel-frame";

const bottom = "2px";

export default page(async () => {
    let $state = "block";
    let $margin = ref([1, 2]);
    let $padding = 4;

    <div
        style={{
            margin: $margin,
            padding: $padding,
            display: $state,
            top: "2px",
            bottom: bottom,
        }}
    />;
});
