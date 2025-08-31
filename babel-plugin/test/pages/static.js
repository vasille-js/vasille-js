import { page } from "vasille-web";
export default page(async (Vasille, props) => {
  Vasille.text(props.path);
}, "#");
