import { component } from "vasille-web";
import { CodeLine } from "../CodeLine.js";
import { Keyword } from "../Keyword.js";
import { Comment } from "../Comment.js";
import { Highlight } from "../Highlight.js";

/*
 * const App = component(() => {
 *   // The callback is called
 *   // when the element and children are mounted
 *   <div callback={div => {
 *     // div is an instance of HTMLDivElement
 *     div.querySelector("input").focus();
 *   }>
 *     <input type="text" oninput={(ev, input) => {
 *       // input is an instance of HTMLInputElement
 *       input.focus();
 *     }}/>
 *   </div>;
 * });
 *
 * */
export const DomExample = component(() => {
  <CodeLine
    number={1}
    content={({ isDark }) => {
      <>
        {"const App = "}
        <Keyword isDark={isDark}>component</Keyword>
        {"(() => {"}
      </>;
    }}
  />;
  <CodeLine
    number={2}
    content={({ isDark }) => {
      <Comment isDark={isDark}>
        {"  // The callback is called when the element is mounted"}
      </Comment>;
    }}
  />;
  <CodeLine
    number={3}
    content={({ isDark }) => {
      <Comment isDark={isDark}>
        {"  // Yes! Its children are mounted too!"}
      </Comment>;
    }}
  />;
  <CodeLine
    number={4}
    content={({ isDark }) => {
      <>
        {"  <"}
        <Keyword isDark={isDark}>div</Keyword>
        {" callback={"}
        <Highlight isDark={isDark}>div</Highlight>
        {" => {"}
      </>;
    }}
  />;
  <CodeLine
    number={5}
    content={({ isDark }) => {
      <Comment isDark={isDark}>
        {"    // div is an instance of HTMLDivElement"}
      </Comment>;
    }}
  />;
  <CodeLine
    number={6}
    content={({ isDark }) => {
      <>
        <span>{"    "}</span>
        <Highlight isDark={isDark}>div</Highlight>
        {'.querySelector("input").focus();'}
      </>;
    }}
  />;
  <CodeLine
    number={7}
    content={() => {
      <>{"  }>"}</>;
    }}
  />;
  <CodeLine
    number={8}
    content={({ isDark }) => {
      <>
        {"    <"}
        <Keyword isDark={isDark}>input</Keyword>
        {' type="text" onmouseover={(ev, '}
        <Highlight isDark={isDark}>input</Highlight>
        {") => {"}
      </>;
    }}
  />;
  <CodeLine
    number={9}
    content={({ isDark }) => {
      <Comment isDark={isDark}>
        {"      // input is an instance of HTMLInputElement"}
      </Comment>;
    }}
  />;
  <CodeLine
    number={10}
    content={({ isDark }) => {
      <>
        <span>{"      "}</span>
        <Highlight isDark={isDark}>input</Highlight>
        {".focus();"}
      </>;
    }}
  />;
  <CodeLine
    number={11}
    content={() => {
      <>{"    }}/>"}</>;
    }}
  />;
  <CodeLine
    number={12}
    content={({ isDark }) => {
      <>
        {"  </"}
        <Keyword isDark={isDark}>div</Keyword>
        {">;"}
      </>;
    }}
  />;
  <CodeLine
    number={13}
    content={() => {
      <>{"});"}</>;
    }}
  />;
  <CodeLine number={14} content={() => {}} />;
});
