import { page, router } from "vasille-web";

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
