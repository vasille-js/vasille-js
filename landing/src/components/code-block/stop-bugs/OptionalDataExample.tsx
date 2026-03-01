import { component } from "steel-frame";
import { CodeLine } from "../CodeLine.js";
import { Keyword } from "../Keyword.js";
import { Comment } from "../Comment.js";
import { Highlight } from "../Highlight.js";

/**
 * const MyComponent = component(() => {
 *   // use "error" to show an error message
 *   // use "profile" to show the profile
 *   // use "reload" to reload the profile
 *   // when the load fails and when the user requires reloading the profile
 *   const [$error, $profile, reload] = awaited(getProfile);
 *
 *   <>
 *     $error ? <ErrorComponent error={$error}/> :
 *     $profile ? <ProfileComponent profile={$profile}/> :
 *     <LoadingComponent />;
 *   </>
 * })
 */

export const OptionalDataExample = component(() => {
  <CodeLine
    number={1}
    content={(props) => {
      <>
        {"const MyComponent = "}
        <Keyword {...props}>component</Keyword>
        {"(() => {"}
      </>;
    }}
  />;
  <CodeLine
    number={2}
    content={(props) => {
      <Comment {...props}>
        {'  // use "error" to show an error message'}
      </Comment>;
    }}
  />;
  <CodeLine
    number={3}
    content={(props) => {
      <Comment {...props}>{'  // use "profile" to show the profile'}</Comment>;
    }}
  />;
  <CodeLine
    number={4}
    content={(props) => {
      <Comment {...props}>{'  // use "reload" to reload the profile'}</Comment>;
    }}
  />;
  <CodeLine
    number={5}
    content={(props) => {
      <Comment {...props}>
        {"  // when the user requires reloading the profile"}
      </Comment>;
    }}
  />;
  <CodeLine
    number={6}
    content={(props) => {
      <>
        {"  const ["}
        <Highlight {...props}>$error</Highlight>
        {", "}
        <Highlight {...props}>$profile</Highlight>
        {", "}
        <Highlight {...props}>reload</Highlight>
        {"] = awaited(getProfile);"}
      </>;
    }}
  />;
  <CodeLine number={7} content={() => {}} />;
  <CodeLine
    number={8}
    content={() => {
      <>{"  <>"}</>;
    }}
  />;
  <CodeLine
    number={9}
    content={(props) => {
      <>
        {"   \xA0"}
        <Highlight {...props}>$error</Highlight>
        {" ? <ErrorComponent error={"}
        <Highlight {...props}>$error</Highlight>
        {"}/> :"}
      </>;
    }}
  />;
  <CodeLine
    number={10}
    content={(props) => {
      <>
        {"   \xA0"}
        <Highlight {...props}>$profile</Highlight>
        {" ? <ProfileComponent profile={"}
        <Highlight {...props}>$profile</Highlight>
        {"}/> :"}
      </>;
    }}
  />;
  <CodeLine
    number={11}
    content={() => {
      <>{"   <LoadingComponent />;"}</>;
    }}
  />;
  <CodeLine
    number={12}
    content={() => {
      <>{"  </>"}</>;
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
