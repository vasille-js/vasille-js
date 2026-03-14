import { component } from "steel-frame";

interface Props {
  $a: number | string;
  $b: string | null | undefined;
  $c: number | null | undefined;
  $d: boolean | null | undefined;
  $e: number | string;
  $f: number | boolean;
  $g: number[] | string[];
  $h;
}

export const UnionTest = component<Props>(() => {});
