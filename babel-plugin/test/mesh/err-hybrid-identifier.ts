import { hybridView } from "vasille-web";

interface Models {
  string: string;
}

interface Props {
  string: string;
}

export const C = hybridView((models: Models, {string}: Props) => {
  console.log(models, string)
})
