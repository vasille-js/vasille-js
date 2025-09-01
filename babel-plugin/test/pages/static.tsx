import { page } from "vasille-web";

export default page<"/static">(async props => {
  <>{props.path}</>;
});
