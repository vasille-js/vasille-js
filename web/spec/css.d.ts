import type {ObsoletePropertiesHyphen, StandardPropertiesHyphen, VendorPropertiesHyphen} from "csstype";

export type RawStyleProps = StandardPropertiesHyphen<string | number | number[], string> &
  VendorPropertiesHyphen<string | number | number[], string> &
  ObsoletePropertiesHyphen<string | number | number[], string> &
  {[variable: `--${string}`]: string};
export type StyleProps = {[K in keyof RawStyleProps]: RawStyleProps[K] | RawStyleProps[K][] };
