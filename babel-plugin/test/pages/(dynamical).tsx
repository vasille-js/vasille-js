import { page } from "vasille-web";

export default page<"/(dynamical)">(async ({ params }) => {
  <>{params.dynamical}</>;
});
