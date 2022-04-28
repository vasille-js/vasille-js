import { EventHandler, HtmlAndSvgEvents, Tag } from "./html";
declare type SvgEvents = {
    [K in keyof SVGElementEventMap]: EventHandler<SVGElementEventMap[K]> | undefined;
};
interface SvgAreaAttrs {
    "aria-activedescendant": string;
    "aria-atomic": string;
    "aria-autocomplete": string;
    "aria-busy": string;
    "aria-checked": string;
    "aria-colcount": string;
    "aria-colindex": string;
    "aria-colspan": string;
    "aria-controls": string;
    "aria-current": string;
    "aria-describedby": string;
    "aria-details": string;
    "aria-disabled": string;
    "aria-dropeffect": string;
    "aria-errormessage": string;
    "aria-expanded": string;
    "aria-flowto": string;
    "aria-grabbed": string;
    "aria-haspopup": string;
    "aria-hidden": string;
    "aria-invalid": string;
    "aria-keyshortcuts": string;
    "aria-label": string;
    "aria-labelledby": string;
    "aria-level": string;
    "aria-live": string;
    "aria-modal": string;
    "aria-multiline": string;
    "aria-multiselectable": string;
    "aria-orientation": string;
    "aria-owns": string;
    "aria-placeholder": string;
    "aria-posinset": string;
    "aria-pressed": string;
    "aria-readonly": string;
    "aria-relevant": string;
    "aria-required": string;
    "aria-roledescription": string;
    "aria-rowcount": string;
    "aria-rowindex": string;
    "aria-rowspan": string;
    "aria-selected": string;
    "aria-setsize": string;
    "aria-sort": string;
    "aria-valuemax": string;
    "aria-valuemin": string;
    "aria-valuenow": string;
    "aria-valuetext": string;
    "role": string;
}
interface SvgConditionalProcessingAtttrs {
    "requiredExtensions": string;
    "systemLanguage": string;
}
interface SvgCoreAttrs {
    "id": string;
    "tabindex": string;
    "lang": string;
    "xml:space": string;
}
interface SvgSvgAttrs extends SvgAreaAttrs, SvgConditionalProcessingAtttrs, SvgCoreAttrs {
    "viewBox": string;
    "preserveAspectRatio": string;
    "zoomAndPan": string;
    "transform": string;
    x: number;
    y: number;
    width: number;
    height: number;
}
interface Svg3in1Attrs extends SvgAreaAttrs, SvgConditionalProcessingAtttrs, SvgCoreAttrs {
}
interface SvgUseAttrs extends Svg3in1Attrs {
    href: string;
}
interface SvgPathLengthAttrs extends Svg3in1Attrs {
    pathLength: number;
    "marker-start": string;
    "marker-mid": string;
    "marker-end": string;
}
interface SvgPathAttrs extends SvgPathLengthAttrs {
    d: string;
}
interface SvgRectAttrs extends SvgPathLengthAttrs {
    x: number;
    y: number;
    width: number;
    height: number;
    rx: number;
    ry: number;
}
interface SvgCircleAttrs extends SvgPathLengthAttrs {
    cx: number;
    cy: number;
    r: number;
}
interface SvgEllipseAttrs extends SvgPathLengthAttrs {
    cx: number;
    cy: number;
    rx: number;
    ry: number;
}
interface SvgLineAttrs extends SvgPathLengthAttrs {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}
interface SvgPolygonAttrs extends SvgPathLengthAttrs {
    points: number;
}
interface SvgCommonTextAttrs extends Svg3in1Attrs {
    x: number;
    y: number;
    dx: number;
    dy: number;
    rotate: number;
    textLength: number;
    lengthAdjust: 'spacing' | 'spacingAndGlyphs';
}
interface SvgTextPathAttrs extends Svg3in1Attrs {
    "lengthAdjust": 'spacing' | 'spacingAndGlyphs';
    "textLength": number;
    "path": string;
    "href": string;
    "startOffset": number;
    "method": 'align' | 'stretch';
    "spacing": 'auto' | 'exact';
    "side": 'left' | 'right';
}
interface SvgImageAttrs extends Svg3in1Attrs {
    "preserveAspectRatio": string;
    "href": string;
    "crossorigin": string;
    x: number;
    y: number;
    width: number;
    height: number;
}
interface SvgForeignObjectAttrs extends Svg3in1Attrs {
    x: number;
    y: number;
    width: number;
    height: number;
}
interface SvgMarkerAttrs extends Svg3in1Attrs {
    "viewBox": string;
    "preserveAspectRatio": string;
    "refX": number;
    "refY": number;
    "markerUnits": 'strokeWidth' | 'userSpaceOnUse';
    "markerWidth": number | `${number}%` | 'left' | 'center' | 'right';
    "markerHeight": number | `${number}%` | 'top' | 'center' | 'bottom';
    "orient": 'auto' | 'auto-start-reverse' | `${number}deg` | number;
}
interface SvgAAttrs extends SvgCoreAttrs {
    href: string;
    "target": '_self' | '_parent' | '_top' | '_blank';
    "download": string;
    "ping": string;
    "rel": string;
    "hreflang": string;
    "type": string;
    "referrerpolicy": string;
}
interface SvgViewAttrs extends SvgCoreAttrs, SvgAreaAttrs {
    "viewBox": string;
    "preserveAspectRatio": string;
    "zoomAndPan": string;
}
export interface SvgTagMap {
    "a": Tag<SvgAAttrs, SvgEvents>;
    "animate": Tag<SvgCoreAttrs, SvgEvents>;
    "animateMotion": Tag<SvgCoreAttrs, SvgEvents>;
    "animateTransform": Tag<SvgCoreAttrs, SvgEvents>;
    "circle": Tag<SvgCircleAttrs, SvgEvents>;
    "clipPath": Tag<SvgCoreAttrs, SvgEvents>;
    "defs": Tag<SvgCoreAttrs, SvgEvents>;
    "desc": Tag<SvgCoreAttrs, SvgEvents>;
    "ellipse": Tag<SvgEllipseAttrs, SvgEvents>;
    "feBlend": Tag<SvgCoreAttrs, SvgEvents>;
    "feColorMatrix": Tag<SvgCoreAttrs, SvgEvents>;
    "feComponentTransfer": Tag<SvgCoreAttrs, SvgEvents>;
    "feComposite": Tag<SvgCoreAttrs, SvgEvents>;
    "feConvolveMatrix": Tag<SvgCoreAttrs, SvgEvents>;
    "feDiffuseLighting": Tag<SvgCoreAttrs, SvgEvents>;
    "feDisplacementMap": Tag<SvgCoreAttrs, SvgEvents>;
    "feDistantLight": Tag<SvgCoreAttrs, SvgEvents>;
    "feDropShadow": Tag<SvgCoreAttrs, SvgEvents>;
    "feFlood": Tag<SvgCoreAttrs, SvgEvents>;
    "feFuncA": Tag<SvgCoreAttrs, SvgEvents>;
    "feFuncB": Tag<SvgCoreAttrs, SvgEvents>;
    "feFuncG": Tag<SvgCoreAttrs, SvgEvents>;
    "feFuncR": Tag<SvgCoreAttrs, SvgEvents>;
    "feGaussianBlur": Tag<SvgCoreAttrs, SvgEvents>;
    "feImage": Tag<SvgCoreAttrs, SvgEvents>;
    "feMerge": Tag<SvgCoreAttrs, SvgEvents>;
    "feMergeNode": Tag<SvgCoreAttrs, SvgEvents>;
    "feMorphology": Tag<SvgCoreAttrs, SvgEvents>;
    "feOffset": Tag<SvgCoreAttrs, SvgEvents>;
    "fePointLight": Tag<SvgCoreAttrs, SvgEvents>;
    "feSpecularLighting": Tag<SvgCoreAttrs, SvgEvents>;
    "feSpotLight": Tag<SvgCoreAttrs, SvgEvents>;
    "feTile": Tag<SvgCoreAttrs, SvgEvents>;
    "feTurbulence": Tag<SvgCoreAttrs, SvgEvents>;
    "filter": Tag<SvgCoreAttrs, SvgEvents>;
    "foreignObject": Tag<SvgForeignObjectAttrs, SvgEvents>;
    "g": Tag<Svg3in1Attrs, SvgEvents>;
    "image": Tag<SvgImageAttrs, SvgEvents>;
    "line": Tag<SvgLineAttrs, SvgEvents>;
    "linearGradient": Tag<SvgCoreAttrs, SvgEvents>;
    "marker": Tag<SvgMarkerAttrs, SvgEvents>;
    "mask": Tag<SvgCoreAttrs, SvgEvents>;
    "metadata": Tag<SvgCoreAttrs, SvgEvents>;
    "mpath": Tag<SvgCoreAttrs, SvgEvents>;
    "path": Tag<SvgPathAttrs, SvgEvents>;
    "pattern": Tag<SvgCoreAttrs, SvgEvents>;
    "polygon": Tag<SvgCoreAttrs, SvgEvents>;
    "polyline": Tag<SvgPolygonAttrs, SvgEvents>;
    "radialGradient": Tag<SvgCoreAttrs, SvgEvents>;
    "rect": Tag<SvgRectAttrs, SvgEvents>;
    "script": Tag<SvgCoreAttrs, SvgEvents>;
    "set": Tag<SvgCoreAttrs, SvgEvents>;
    "stop": Tag<SvgCoreAttrs, SvgEvents>;
    "style": Tag<SvgCoreAttrs, SvgEvents>;
    "svg": Tag<SvgSvgAttrs, SvgEvents>;
    "switch": Tag<Svg3in1Attrs, SvgEvents>;
    "symbol": Tag<SvgCoreAttrs, SvgEvents>;
    "text": Tag<SvgCommonTextAttrs, SvgEvents>;
    "textPath": Tag<SvgTextPathAttrs, SvgEvents>;
    "title": Tag<SvgCoreAttrs, SvgEvents>;
    "tspan": Tag<SvgCommonTextAttrs, SvgEvents>;
    "use": Tag<SvgUseAttrs, SvgEvents>;
    "view": Tag<SvgViewAttrs, SvgEvents>;
}
declare type SvgTag = HtmlAndSvgEvents;
interface SvgATag extends SvgTag {
    rel: string;
}
interface SvgSvgTag extends SvgTag {
    currentScale: number;
}
export interface SvgTagNameMap {
    "a": SvgATag;
    "animate": SvgTag;
    "animateMotion": SvgTag;
    "animateTransform": SvgTag;
    "circle": SvgTag;
    "clipPath": SvgTag;
    "defs": SvgTag;
    "desc": SvgTag;
    "ellipse": SvgTag;
    "feBlend": SvgTag;
    "feColorMatrix": SvgTag;
    "feComponentTransfer": SvgTag;
    "feComposite": SvgTag;
    "feConvolveMatrix": SvgTag;
    "feDiffuseLighting": SvgTag;
    "feDisplacementMap": SvgTag;
    "feDistantLight": SvgTag;
    "feDropShadow": SvgTag;
    "feFlood": SvgTag;
    "feFuncA": SvgTag;
    "feFuncB": SvgTag;
    "feFuncG": SvgTag;
    "feFuncR": SvgTag;
    "feGaussianBlur": SvgTag;
    "feImage": SvgTag;
    "feMerge": SvgTag;
    "feMergeNode": SvgTag;
    "feMorphology": SvgTag;
    "feOffset": SvgTag;
    "fePointLight": SvgTag;
    "feSpecularLighting": SvgTag;
    "feSpotLight": SvgTag;
    "feTile": SvgTag;
    "feTurbulence": SvgTag;
    "filter": SvgTag;
    "foreignObject": SvgTag;
    "g": SvgTag;
    "image": SvgTag;
    "line": SvgTag;
    "linearGradient": SvgTag;
    "marker": SvgTag;
    "mask": SvgTag;
    "metadata": SvgTag;
    "mpath": SvgTag;
    "path": SvgTag;
    "pattern": SvgTag;
    "polygon": SvgTag;
    "polyline": SvgTag;
    "radialGradient": SvgTag;
    "rect": SvgTag;
    "script": SvgTag;
    "set": SvgTag;
    "stop": SvgTag;
    "style": SvgTag;
    "svg": SvgSvgTag;
    "switch": SvgTag;
    "symbol": SvgTag;
    "text": SvgTag;
    "textPath": SvgTag;
    "title": SvgTag;
    "tspan": SvgTag;
    "use": SvgTag;
    "view": SvgTag;
}
export {};
