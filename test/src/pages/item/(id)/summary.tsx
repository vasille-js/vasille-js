import { router, screen } from "steel-frame";

export default screen<"/item/(id)/summary">(async props => {
  <div
    onclick={() => {
      router()?.goTo("/");
    }}
  >
    Summary of item {props.params.id}
  </div>;
});
