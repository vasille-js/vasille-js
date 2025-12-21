import { component } from "vasille-web";
import { CodeLine } from "../CodeLine.js";
import { Highlight } from "../Highlight.js";
import { Keyword } from "../Keyword.js";

/*
 * interface Props {
 *   name: string;
 * }
 * const Hello = component<Props>(({name}) => {
 *   <h1>Hello {name}!</h1>;
 * });
 * const App = component(() => {
 *   <Hello name="World"/>;
 * });
 * */
export const PropertiesExample = component(() => {
  <CodeLine
    number={1}
    content={() => {
      <>{"interface Props {"}</>;
    }}
  />;
  <CodeLine
    number={2}
    content={({ isDark }) => {
      <>
        <span>{"  "}</span>
        <Highlight isDark={isDark}>name</Highlight>
        {" : string;"}
      </>;
    }}
  />;
  <CodeLine
    number={3}
    content={() => {
      <>{"}"}</>;
    }}
  />;
  <CodeLine
    number={4}
    content={({ isDark }) => {
      <>
        {"const "}
        <Keyword isDark={isDark}>Hello</Keyword>
        {" = "}
        <Keyword isDark={isDark}>component</Keyword>
        {"<Props>(({"}
        <Highlight isDark={isDark}>name</Highlight>
        {"}) => {"}
      </>;
    }}
  />;
  <CodeLine
    number={5}
    content={({ isDark }) => {
      <>
        {"  <"}
        <Keyword isDark={isDark}>h1</Keyword>
        {">Hello {"}
        <Highlight isDark={isDark}>name</Highlight>
        {"}!</"}
        <Keyword isDark={isDark}>h1</Keyword>
        {">;"}
      </>;
    }}
  />;
  <CodeLine
    number={6}
    content={() => {
      <>{"});"}</>;
    }}
  />;
  <CodeLine
    number={7}
    content={({ isDark }) => {
      <>
        {"const App = "}
        <Keyword isDark={isDark}>component</Keyword>
        {"(() => {"}
      </>;
    }}
  />;
  <CodeLine
    number={8}
    content={({ isDark }) => {
      <>
        {"  <"}
        <Keyword isDark={isDark}>Hello</Keyword>
        <span>{"\xa0"}</span>
        <Highlight isDark={isDark}>name</Highlight>
        {'="World"/>;'}
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
