import { component } from "steel-frame";
import { CodeLine } from "../CodeLine.js";
import { Keyword } from "../Keyword.js";
import { Highlight } from "../Highlight.js";
import { Comment } from "../Comment.js";

export const ApiChangeExample = component(() => {
  <CodeLine
    number={1}
    content={({ isDark }) => {
      <>
        <Keyword isDark={isDark}>const</Keyword>
        {"\xA0"}
        <Highlight isDark={isDark}>ProductPage</Highlight>
        {" = "}
        <Keyword isDark={isDark}>component</Keyword>
        {"(() => {"}
      </>;
    }}
  />;
  <CodeLine
    number={2}
    content={({ isDark }) => {
      <>
        <Comment isDark={isDark}>
          {"  // API changed? Data structure broken?"}
        </Comment>
      </>;
    }}
  />;
  <CodeLine
    number={3}
    content={({ isDark }) => {
      <>
        <Keyword isDark={isDark}>const</Keyword>
        {" recommendations = "}
        <Highlight isDark={isDark}>getRecommendations</Highlight>
        {"(); "}
        <Comment isDark={isDark}>{"// Potential error"}</Comment>
      </>;
    }}
  />;
  <CodeLine number={4} content={() => {}} />;
  <CodeLine
    number={5}
    content={({ isDark }) => {
      <Comment isDark={isDark}>
        {"  // It it fails, only the recommendations disappear"}
      </Comment>;
    }}
  />;
  <CodeLine
    number={6}
    content={({ isDark }) => {
      <>
        {"  <RecommendationSlider "}
        <Keyword isDark={isDark}>products</Keyword>
        {"="}
        <Keyword isDark={isDark}>{"{recommendations}"}</Keyword>
        {" />;"}
      </>;
    }}
  />;
  <CodeLine number={7} content={() => {}} />;
  <CodeLine
    number={8}
    content={({ isDark }) => {
      <Comment isDark={isDark}>
        {"  // These components keep working:"}
      </Comment>;
    }}
  />;
  <CodeLine
    number={9}
    content={({ isDark }) => {
      <>
        {"  <ProductGallery />;   "}
        <Comment isDark={isDark}>{"// Always visible"}</Comment>
      </>;
    }}
  />;
  <CodeLine
    number={10}
    content={({ isDark }) => {
      <>
        {"  <AddToCardButton />;  "}
        <Comment isDark={isDark}>{"// Always functional"}</Comment>
      </>;
    }}
  />;
  <CodeLine
    number={11}
    content={({ isDark }) => {
      <>
        {"  <CustomersReviews />; "}
        <Comment isDark={isDark}>{"// Never affected"}</Comment>
      </>;
    }}
  />;
  <CodeLine
    number={12}
    content={() => {
      <>{"});"}</>;
    }}
  />;
  <CodeLine number={13} content={() => {}} />;
});
