import { page, router } from "steel-frame";

export default page(async () => {
  <div
    class={"test"}
    onclick={() => {
      router()?.goTo("/page/1");
    }}
  >
    Test screen
  </div>;
});
