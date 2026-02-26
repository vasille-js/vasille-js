import { page, router } from "steel-frame";

export default page<"/page/(number)">(async props => {
  <div
    onclick={() => {
      router()?.goTo("/item/77/summary");
    }}
  >
    Number {props.params.number}
  </div>;
});
