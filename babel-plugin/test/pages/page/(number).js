import { page } from "vasille-web";
export default page(async (Vasille, {
  params
}) => {
  Vasille.text(params.number);
});
