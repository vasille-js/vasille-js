import { component } from "steel-frame";
import { CodeLine } from "../CodeLine.js";
import { Comment } from "../Comment.js";
import { Highlight } from "../Highlight.js";
import { Keyword } from "../Keyword.js";

/**
 * // Button props were changed
 * // Backward compatibility is missing
 * import Button from "./Button.js";
 *
 * const MyComponent = component(() => {
 *   // This usage will throw an error
 *   <Button height={"24"}>Click me</Button>;
 *   // This usage will work fine
 *   // Even if the previous usage throws an error
 *   <Button height={24}>Click me</Button>;
 * })
 */

export const NoTypescriptExample = component(() => {
  <CodeLine
    number={1}
    content={(props) => {
      <Comment {...props}>{"// Button props were changed"}</Comment>;
    }}
  />;
  <CodeLine
    number={2}
    content={(props) => {
      <Comment {...props}>{"// Backward compatibility is missing"}</Comment>;
    }}
  />;
  <CodeLine
    number={3}
    content={(props) => {
      <>
        {"import "}
        <Highlight {...props}>Button</Highlight>
        {' from "./Button.js";'}
      </>;
    }}
  />;
  <CodeLine number={4} content={() => {}} />;
  <CodeLine
    number={5}
    content={(props) => {
      <>
        {"const MyComponent = "}
        <Keyword {...props}>component</Keyword>
        {"(() => {"}
      </>;
    }}
  />;
  <CodeLine
    number={6}
    content={(props) => {
      <Comment {...props}>{"  // This usage will throw an error"}</Comment>;
    }}
  />;
  <CodeLine
    number={7}
    content={(props) => {
      <>
        {"  <"}
        <Highlight {...props}>Button</Highlight>
        {' height={"24"}>Click me</'}
        <Highlight {...props}>Button</Highlight>
        {">"}
      </>;
    }}
  />;
  <CodeLine
    number={8}
    content={(props) => {
      <Comment {...props}>{"  // This usage will work fine"}</Comment>;
    }}
  />;
  <CodeLine
    number={9}
    content={(props) => {
      <Comment {...props}>
        {"  // Even if the previous usage throws an error"}
      </Comment>;
    }}
  />;
  <CodeLine
    number={10}
    content={(props) => {
      <>
        {"  <"}
        <Highlight {...props}>Button</Highlight>
        {" height={24}>Click me</"}
        <Highlight {...props}>Button</Highlight>
        {">"}
      </>;
    }}
  />;
  <CodeLine
    number={11}
    content={() => {
      <>{"});"}</>;
    }}
  />;
  <CodeLine number={12} content={() => {}} />;
});
