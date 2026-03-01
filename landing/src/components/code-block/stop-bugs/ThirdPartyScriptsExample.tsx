import { component } from "steel-frame";
import { CodeLine } from "../CodeLine.js";
import { Comment } from "../Comment.js";
import { Highlight } from "../Highlight.js";
import { Keyword } from "../Keyword.js";

/**
 * // Third party scripts fail to load when of CDN is down
 * const MyComponent = component(() => {
 *   function onClick() {
 *     // the error here is automatically catch and reported
 *     window.$("button").text("Hello World!");
 *   }
 *
 *   <button onclick={onClick}>Click me</button>;
 *
 *   afterMount(() => {
 *     // the error here is automatically catch and reported
 *     window.$("button").addClass("active");
 *   });
 * });
 */

export const ThirdPartyScriptsExample = component(() => {
  <CodeLine
    number={1}
    content={(props) => {
      <Comment {...props}>
        {"// Third party scripts fail to load when of CDN is down"}
      </Comment>;
    }}
  />;
  <CodeLine
    number={2}
    content={(props) => {
      <>
        {"const MyComponent = "}
        <Highlight {...props}>component</Highlight>
        {"(() => {"}
      </>;
    }}
  />;
  <CodeLine
    number={3}
    content={(props) => {
      <>
        {"  function "}
        <Keyword {...props}>onClick</Keyword>
        {"() {"}
      </>;
    }}
  />;
  <CodeLine
    number={4}
    content={(props) => {
      <Comment {...props}>
        {"    // the errors here are automatically catch and reported"}
      </Comment>;
    }}
  />;
  <CodeLine
    number={5}
    content={() => {
      <>{'    window.$("button").text("Hello World!");'}</>;
    }}
  />;
  <CodeLine
    number={6}
    content={() => {
      <>{"  }"}</>;
    }}
  />;
  <CodeLine number={7} content={() => {}} />;
  <CodeLine
    number={8}
    content={(props) => {
      <>
        {"  <button onclick={"}
        <Keyword {...props}>onClick</Keyword>
        {"}>Click me</button>"}
      </>;
    }}
  />;
  <CodeLine number={9} content={() => {}} />;
  <CodeLine
    number={10}
    content={(props) => {
      <>
        <Highlight {...props}>{"  afterMount"}</Highlight>
        {"(() => {"}
      </>;
    }}
  />;
  <CodeLine
    number={11}
    content={(props) => {
      <Comment {...props}>
        {"    // the errors here are automatically catch and reported"}
      </Comment>;
    }}
  />;
  <CodeLine
    number={12}
    content={() => {
      <>{'    window.$("button").addClass("active");'}</>;
    }}
  />;
  <CodeLine
    number={13}
    content={() => {
      <>{"  });"}</>;
    }}
  />;
  <CodeLine
    number={14}
    content={() => {
      <>{"});"}</>;
    }}
  />;
  <CodeLine number={15} content={() => {}} />;
});
