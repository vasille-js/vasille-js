import { beforeMount, compose } from "steel-frame";

export default compose(() => {
  beforeMount(() => {
    document.querySelector(".loading-page")?.remove();
  });
  <div class="loading-page">
    <div class="logo"></div>
    <div class="loader"></div>
  </div>;
});
