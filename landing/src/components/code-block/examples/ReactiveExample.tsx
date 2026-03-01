import { component } from "steel-frame";
import { CodeLine } from "../CodeLine.js";
import { Comment } from "../Comment.js";
import { Highlight } from "../Highlight.js";
import { Keyword } from "../Keyword.js";

/*
 * const HelloWorld = component(() => {
 *   // This is a reactive state
 *   let $name = "World";
 *   // This is a derived reactive state
 *   const $message = `Hello ${$name}!`;
 *   // This function will update the reactive state
 *   function changeName() {
 *     $name = "Steel Frame Kit";
 *   }
 *   // Render the template
 *   <h1 onclick={changeName}>{$message}</h1>;
 * })
 * */
export const ReactiveExample = component(() => {
  <CodeLine
    number={1}
    content={({ isDark }) => {
      <>
        {"const HelloWorld = "}
        <Keyword isDark={isDark}>component</Keyword>
        {"(() => {"}
      </>;
    }}
  />;
  <CodeLine
    number={2}
    content={({ isDark }) => {
      <Comment isDark={isDark}>{"  // This is a reactive state"}</Comment>;
    }}
  />;
  <CodeLine
    number={3}
    content={({ isDark }) => {
      <>
        {"  let "}
        <Highlight isDark={isDark}>$name</Highlight>
        {" = 'World';"}
      </>;
    }}
  />;
  <CodeLine
    number={4}
    content={({ isDark }) => {
      <Comment isDark={isDark}>
        {"  // This is a derived reactive state"}
      </Comment>;
    }}
  />;
  <CodeLine
    number={5}
    content={({ isDark }) => {
      <>
        {"  const "}
        <Highlight isDark={isDark}>$message</Highlight>
        {" = `Hello ${"}
        <Highlight isDark={isDark}>$name</Highlight>
        {"}!`;"}
      </>;
    }}
  />;
  <CodeLine
    number={6}
    content={({ isDark }) => {
      <Comment isDark={isDark}>
        {"  // This function will update the reactive state"}
      </Comment>;
    }}
  />;
  <CodeLine
    number={7}
    content={() => {
      <>{"  function changeName() {"}</>;
    }}
  />;
  <CodeLine
    number={8}
    content={({ isDark }) => {
      <>
        <span>{"    "}</span>
        <Highlight isDark={isDark}>$name</Highlight>
        {" = 'Steel Frame Kit';"}
      </>;
    }}
  />;
  <CodeLine
    number={9}
    content={() => {
      <>{"  }"}</>;
    }}
  />;
  <CodeLine
    number={10}
    content={({ isDark }) => {
      <>
        {"  <"}
        <Keyword isDark={isDark}>h1</Keyword>
        {" onclick={changeName}>{"}
        <Highlight isDark={isDark}>$message</Highlight>
        {"}</"}
        <Keyword isDark={isDark}>h1</Keyword>
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
