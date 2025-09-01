import type {ObsoletePropertiesHyphen, StandardPropertiesHyphen, VendorPropertiesHyphen} from "csstype";

export type RawStyleProps = StandardPropertiesHyphen<string | number | number[]> &
  VendorPropertiesHyphen<string | number | number[]> &
  ObsoletePropertiesHyphen<string | number | number[]> &
  {[variable: `--${string}`]: string};
export type StyleProps = {[K in keyof RawStyleProps]: RawStyleProps[K] | RawStyleProps[K][] };
