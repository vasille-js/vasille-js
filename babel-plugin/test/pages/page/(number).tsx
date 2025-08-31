import {page} from "vasille-web";

export default page<"/page/(number)">(async ({params}) => {
  <>{params.number}</>;
});
