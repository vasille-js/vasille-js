import { page } from "steel-frame";

export default page<"/page/(number)">(async ({ params }) => {
  <>{params.number}</>;
});
