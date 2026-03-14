import { component } from "steel-frame";

export const PropsTest = component<{
  $a: number;
  b: string;
  c: boolean;
  d?: string;
  e: number[];
  f: number | null;
  g?: number | null | undefined;
}>(() => {});
