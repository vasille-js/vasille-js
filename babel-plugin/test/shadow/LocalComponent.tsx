// @ts-ignore
import TestFirstComponent from "./TestComponent.tsx";
// @ts-ignore
import { TestSecondComponent as TestThirdComponent } from "@/components/TestSecondComponent.js";
// @ts-ignore
import { TestFourthComponent } from "@/components/not-local/TestFourthComponent.jsx";
import { component } from "steel-frame";

export const LocalComponent = component<{}>(() => {
  <TestFirstComponent name={"first"}>
    <div></div>
  </TestFirstComponent>;
  <TestThirdComponent
    name={"third"}
    id={1}
    onClick={() => {
      console.log("test");
    }}
  />;
  // this will trigger an error when field name is changed
  // match it with previous one
  <div bind:autofocus>
    <span></span>
  </div>;
  // this must not be threaded as a local component
  <TestFourthComponent name={"fourth"} />;
});
