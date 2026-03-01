import { component } from "steel-frame";
import { CodeLine } from "../CodeLine.js";
import { Keyword } from "../Keyword.js";
import { Highlight } from "../Highlight.js";
import { Comment } from "../Comment.js";

/**
 * export default page(({params}) => {
 *   // This error is caught automatically
 *   // A fallback screen will be shown
 *   // The request can be easily retried
 *   // Single solution for all critical data
 *   const profileData = await getProfile(params.id);
 *
 *   <UserProfile profile={profileData}/>;
 * });
 */

export const BackendIsDownExample = component(() => {
  <CodeLine
    number={1}
    content={(props) => {
      <>
        {"export default "}
        <Keyword {...props}>page</Keyword>
        {"(({"}
        <Highlight {...props}>params</Highlight>
        {"}) => {"}
      </>;
    }}
  />;
  <CodeLine
    number={2}
    content={(props) => {
      <Comment {...props}>{"  // This error is caught automatically"}</Comment>;
    }}
  />;
  <CodeLine
    number={3}
    content={(props) => {
      <Comment {...props}>
        {"  // A custom fallback screen will be shown"}
      </Comment>;
    }}
  />;
  <CodeLine
    number={4}
    content={(props) => {
      <Comment {...props}>{"  // The request can be easily retried"}</Comment>;
    }}
  />;
  <CodeLine
    number={5}
    content={(props) => {
      <Comment {...props}>
        {"  // Single solution for all critical data"}
      </Comment>;
    }}
  />;
  <CodeLine
    number={6}
    content={(props) => {
      <>
        {"  const profileData = await getProfile("}
        <Highlight {...props}>params</Highlight>
        {".id);"}
      </>;
    }}
  />;
  <CodeLine number={7} content={() => {}} />;
  <CodeLine
    number={8}
    content={() => {
      <>{"  <UserProfile profile={profileData}/>;"}</>;
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
