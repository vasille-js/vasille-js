import { component } from "steel-frame";
import { CodeLine } from "../CodeLine.js";
import { Highlight } from "../Highlight.js";
import { Keyword } from "../Keyword.js";
import { Comment } from "../Comment.js";

/**
 * import { formatTime } from "npm-package";
 *
 * const MyComponent = component(() => {
 *   function onClick() {
 *     // do something
 *   }
 *   // The button is shown and onClick will be called on click
 *   // even if the formatTime function throws an error
 *   <button onclick={onClick}>{formatTime(new Date())}</button>;
 * });
 */

export const NpmUpdateExample = component(() => {
  <CodeLine
    number={1}
    content={(props) => {
      <>
        {"import { "}
        <Highlight {...props}>formatTime</Highlight>
        {' } from "npm-package";'}
      </>;
    }}
  />;
  <CodeLine number={2} content={() => {}} />;
  <CodeLine
    number={3}
    content={(props) => {
      <>
        {"const MyComponent = "}
        <Highlight {...props}>component</Highlight>
        {"(() => {"}
      </>;
    }}
  />;
  <CodeLine
    number={4}
    content={(props) => {
      <>
        {"  function "}
        <Keyword {...props}>onClick</Keyword>
        {"() {"}
      </>;
    }}
  />;
  <CodeLine
    number={5}
    content={(props) => {
      <Comment {...props}>{"    // do something"}</Comment>;
    }}
  />;
  <CodeLine
    number={6}
    content={() => {
      <>{"  }"}</>;
    }}
  />;
  <CodeLine
    number={7}
    content={(props) => {
      <Comment {...props}>
        {"  // The button is shown and onClick will be called on click"}
      </Comment>;
    }}
  />;
  <CodeLine
    number={8}
    content={(props) => {
      <Comment {...props}>
        {"  // even if the formatTime function throws an error"}
      </Comment>;
    }}
  />;
  <CodeLine
    number={9}
    content={(props) => {
      <>
        {"  <button onclick={"}
        <Keyword {...props}>onClick</Keyword>
        {"}>"}
        <Highlight {...props}>formatTime</Highlight>
        {"(new Date())}</button>"}
      </>;
    }}
  />;
  <CodeLine
    number={10}
    content={() => {
      <>{"});"}</>;
    }}
  />;
  <CodeLine number={11} content={() => {}} />;
});
