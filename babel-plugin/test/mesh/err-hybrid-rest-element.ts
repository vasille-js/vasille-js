import { hybridView } from "vasille-web";

interface Models {
  string: string;
}

interface Props {
  string: string;
}

export const C = hybridView(({ string: s0 }: Models, { ...rest }: Props) => {
  console.log(s0, rest);
});
