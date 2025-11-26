import { page } from "steel-frame";

export default page<"/(dynamical)">(async ({ params }) => {
  <>{params.dynamical}</>;
});
