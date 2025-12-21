import { component } from "vasille-web";
import { CodeLine } from "../CodeLine.js";
import { Comment } from "../Comment.js";
import { Highlight } from "../Highlight.js";
import { Keyword } from "../Keyword.js";

/*
 * // Data from any source
 * // can be passed to the template
 * const name = "World";
 * // Example of a hello world component
 * const HelloWorld = component(() => {
 *   // Data can be local in the component
 *   const adjective = "Beautiful";
 *   // Passing adjective and name to the template
 *   <h1>Hello {adjective} {name}!</h1>;
 * });
 * */
export const TemplateExample = component(() => {
  <CodeLine
    number={1}
    content={({ isDark }) => {
      <Comment isDark={isDark}>
        // Data from any source can be passed to the template
      </Comment>;
    }}
  />;
  <CodeLine
    number={2}
    content={({ isDark }) => {
      <>
        {"const "}
        <Highlight isDark={isDark}>name</Highlight>
        {" = 'World';"}
      </>;
    }}
  />;
  <CodeLine
    number={3}
    content={({ isDark }) => {
      <Comment isDark={isDark}>// Example of a hello world component</Comment>;
    }}
  />;
  <CodeLine
    number={4}
    content={({ isDark }) => {
      <>
        {"const HelloWorld = "}
        <Keyword isDark={isDark}>component</Keyword>
        {"(() => {"}
      </>;
    }}
  />;
  <CodeLine
    number={5}
    content={({ isDark }) => {
      <Comment isDark={isDark}>
        {"  // Data can be local in the component"}
      </Comment>;
    }}
  />;
  <CodeLine
    number={6}
    content={({ isDark }) => {
      <>
        {"  const "}
        <Highlight isDark={isDark}>adjective</Highlight>
        {" = 'Beautiful';"}
      </>;
    }}
  />;
  <CodeLine
    number={7}
    content={({ isDark }) => {
      <Comment isDark={isDark}>
        {"  // Passing adjective and name to the template"}
      </Comment>;
    }}
  />;
  // <h1>Hello {adjective} {name}!</h1>;
  <CodeLine
    number={8}
    content={({ isDark }) => {
      <>
        {"  <"}
        <Keyword isDark={isDark}>h1</Keyword>
        {">Hello {"}
        <Highlight isDark={isDark}>adjective</Highlight>
        {"} {"}
        <Highlight isDark={isDark}>name</Highlight>
        {"}!</"}
        <Keyword isDark={isDark}>h1</Keyword>
        {">"}
      </>;
    }}
  />;
  <CodeLine
    number={9}
    content={() => {
      <>{"});"}</>;
    }}
  />;
  <CodeLine number={10} content={() => {}} />;
});
