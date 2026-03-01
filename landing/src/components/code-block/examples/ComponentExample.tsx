import { component } from "steel-frame";
import { CodeLine } from "../CodeLine.js";
import { Comment } from "../Comment.js";
import { Highlight } from "../Highlight.js";
import { Keyword } from "../Keyword.js";

/*
 * // Wrap a function in a "component" call to use it as a custom element.
 * const MyComponent = component(() => {
 *   <h1>Hello World</h1>;
 * });
 * mount(document.body, MyComponent, {});
 * */

export const ComponentExample = component(() => {
  <CodeLine
    number={1}
    content={({ isDark }) => {
      <>
        <Comment isDark={isDark}>
          // Wrap a function in a "component" call to use it as a custom element
        </Comment>
      </>;
    }}
  />;
  <CodeLine
    number={2}
    content={({ isDark }) => {
      <>
        {"const "}
        <Highlight isDark={isDark}>MyComponent</Highlight>
        {" = "}
        <Keyword isDark={isDark}>component</Keyword>
        {"(() => {"}
      </>;
    }}
  />;
  <CodeLine
    number={3}
    content={({ isDark }) => {
      <>
        <Comment isDark={isDark}>{"  // Paste any valid HTML here"}</Comment>
      </>;
    }}
  />;
  <CodeLine
    number={4}
    content={({ isDark }) => {
      <>
        {"  <"}
        <Keyword isDark={isDark}>h1</Keyword>
        {">Hello World</"}
        <Keyword isDark={isDark}>h1</Keyword>
        {">"}
      </>;
    }}
  />;
  <CodeLine
    number={5}
    content={({}) => {
      <>{"});"}</>;
    }}
  />;
  <CodeLine
    number={6}
    content={({ isDark }) => {
      <>
        <Comment isDark={isDark}>{"// Mount the component"}</Comment>
      </>;
    }}
  />;
  <CodeLine
    number={7}
    content={({ isDark }) => {
      <>
        {"mount(document.body, "}
        <Highlight isDark={isDark}>MyComponent</Highlight>
        {", {});"}
      </>;
    }}
  />;
  <CodeLine number={8} content={() => {}} />;
});
