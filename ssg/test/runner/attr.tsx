import { page } from "steel-frame";

export default page(async () => {
    let $state = "$state";

    <div data-string={"string"} data-number={12} data-bool={true} data-true data-false={false} data-ivalue={$state} />;
});
