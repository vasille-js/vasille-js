import { component } from "vasille-web";
import { CodeLine } from "../CodeLine.js";
import { Highlight } from "../Highlight.js";
import { Keyword } from "../Keyword.js";

/*
 * interface Props {
 *   slot(): void;
 * }
 * const Hello = component<Props>(({slot}) => {
 *   <h1>
 *     Hello <Slot model={slot}/>!
 *   </h1>;
 * });
 * const HelloWorld = component(() => {
 *   <Hello>World</Hello>;
 * });
 *
 * */
export const SlotsExample = component(() => {
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
        <Highlight isDark={isDark}>slot</Highlight>
        {"(): void;"}
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
        {"const Hello = "}
        <Keyword isDark={isDark}>component</Keyword>
        {"<Props>(({"}
        <Highlight isDark={isDark}>slot</Highlight>
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
        {">"}
      </>;
    }}
  />;
  <CodeLine
    number={6}
    content={({ isDark }) => {
      <>
        {"    Hello <Slot model={"}
        <Highlight isDark={isDark}>slot</Highlight>
        {"}/>!"}
      </>;
    }}
  />;
  <CodeLine
    number={7}
    content={({ isDark }) => {
      <>
        {"  <"}
        <Keyword isDark={isDark}>h1</Keyword>
        {">;"}
      </>;
    }}
  />;
  <CodeLine
    number={8}
    content={() => {
      <>{"});"}</>;
    }}
  />;
  <CodeLine
    number={9}
    content={({ isDark }) => {
      <>
        {"const HelloWorld = "}
        <Keyword isDark={isDark}>component</Keyword>
        {"(() => {"}
      </>;
    }}
  />;
  <CodeLine
    number={10}
    content={({ isDark }) => {
      <>
        {"  <Hello>"}
        <Highlight isDark={isDark}>World</Highlight>
        {"</Hello>;"}
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
