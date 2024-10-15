import { SvgTagMap, SvgTagNameMap } from "./svg";
import { HtmlTagMap, TagNameMap } from "./html";

export type AcceptedTagsMap = TagNameMap & SvgTagNameMap;

export type AcceptedTagsSpec = HtmlTagMap & SvgTagMap;
