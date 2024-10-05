import {ArrayModel, Fragment, MapModel, ObjectModel, SetModel} from "vasille";
import {IValue as _IValue, Pointer as _Pointer} from "vasille";
import {ListenableModel} from "vasille/types/models/model";
import {AcceptedTagsMap, AcceptedTagsSpec} from "vasille/types/spec/react";
import {AttrType} from "vasille/types/functional/options";
import {transform} from "./ts";



export default transform;

export interface FragmentOptions {
    "v:is" : Record<string, IValue<any>>;
    return ?: {[key : string]: any};
    slot ?: (...args: any[]) => void;
}

export interface TagOptions<T extends keyof AcceptedTagsMap> extends FragmentOptions {
    "v:attr" : { [K in keyof AcceptedTagsSpec[T]['attrs']]?: AttrType<AcceptedTagsSpec[T]['attrs'][K]> };
    class ?: (string | IValue<string> | Record<string, IValue<boolean> | boolean>)[]
        | string
        | Record<string, IValue<boolean> | boolean>;
    style ?: Record<string, string | IValue<string> | [number | string | IValue<number | string>, string]>;

    "v:events" : Partial<AcceptedTagsSpec[T]['events']>

    "v:set" : AcceptedTagsMap[T]
    "v:bind" : { [K in keyof AcceptedTagsMap[T]] : IValue<AcceptedTagsMap[T][K]> }
}

export interface TagOptionsWithSlot<T extends keyof AcceptedTagsMap> extends TagOptions<T> {
    return : {
        node : (HTMLElementTagNameMap & SVGElementTagNameMap)[T];
    }
}

export interface AppOptions<K extends keyof AcceptedTagsMap> extends TagOptions<K> {
    debugUi ?: boolean
}

export interface PortalOptions extends AppOptions<'div'> {
    node : Element
}

type prefixedObject<T, P extends string> = {
    [K in keyof T as K extends string ? `${P}${K}` : never]: T[K]
}

export type IValue<T> = T & _IValue<T>;
export type Pointer<T> = IValue<T> & _Pointer<T>;

export type VInput<T extends FragmentOptions> =
    Omit<T, 'v-is' | 'return'> &
    prefixedObject<T['v:is'], 'is:'> &
    prefixedObject<T['return'], 'returns:'>;

export type VTagInputBase<K extends keyof AcceptedTagsMap, T extends TagOptions<K>> =
    Omit<T, 'v:set' | 'v:bind' | 'v:attr' | 'v:events' | 'v:is' | 'return'> &
    prefixedObject<T['v:events'], 'on'> &
    prefixedObject<T['v:is'], 'is:'> &
    prefixedObject<T['v:set'], 'set:'> &
    prefixedObject<T['v:bind'], 'bind:'> &
    {
        "vx:set"?: Record<string, any>,
        "vx:bind"?: Record<string, IValue<any>>,
        "vx:attr" ?: Record<string, AttrType<string | number | boolean>>
    };

export type VTagInput<K extends keyof AcceptedTagsMap, T extends TagOptions<K> = TagOptions<K>> =
    VTagInputBase<K, T> &
    prefixedObject<T['v:attr'], 'attr:'> &
    Partial<prefixedObject<T['return'], 'returns:'>>;

export type VJsxInput<K extends keyof AcceptedTagsMap, T extends TagOptions<K> = TagOptions<K>> =
    VTagInputBase<K, T> &
    T['v:attr'] &
    {[K : `class:${string}`] : boolean} &
    {'returns:node'?: (HTMLElementTagNameMap & SVGElementTagNameMap)[K]};



export declare function debug(text : IValue<string>) : void;

export declare function arrayModel<T>(arr ?: T[]) : ArrayModel<T>;

export declare function mapModel<K, T>(map ?: [K, T][]) : MapModel<K, T>;

export declare function setModel<T>(arr ?: T[]) : SetModel<T>;

export declare function objectModel<T>(obj ?: { [p : string] : T }) : ObjectModel<T>;

export declare function ref<T>(value : T) : [IValue<T>, (value : T) => void];

export declare function value<T>(value : T) : IValue<T>;

export declare function mirror<T>(value : IValue<T>) : IValue<T>;

export declare function forward<T>(value : IValue<T>) : IValue<T>;

export declare function point<T>(value : IValue<T>) : Pointer<T>;

export declare function expr<T>(ex : (() => T) | T) : IValue<T>;

export declare function watch (func : () => void) : void;

export declare function valueOf<T>(value : IValue<T>) : T;

export declare function setValue<T>(ref : IValue<T>, value : T) : void;

export declare function VxWatch<T>(options: { model: IValue<T>, slot?: (value : T) => void }) : void;

export declare function VxExtend<K extends keyof AcceptedTagsMap>
    (options: { model: K } & VJsxInput<K, TagOptions<K>>) : void;

export declare function VxSlot<T extends object = {}>
    (options: { model: (() => any) | ((input : T) => any), slot?: () => any} & T) : void;

export declare function VxFor<T, K>
    (options: {model : ListenableModel<K, T>, slot ?: (value : T, index : K) => void}) : void;

export declare function VxPortal(options: PortalOptions) : void;

type ExtractParams<T> = T extends ((node : Fragment, ...args: infer P) => any) ? P : never;

export type VReactive<In = void, Out = {}> =
    (opts: In) => Out & {destructor?: () => void};

export type VApp
    <In extends AppOptions<any> = AppOptions<'div'>> =
        (node: Element, opts : In extends TagOptions<infer K> ? VTagInput<K, In> : never) => Required<In>['return'];

export type VComponent
    <In extends TagOptions<any>> =
        (opts : In extends TagOptions<infer K> ? VTagInput<K, In> : never, callback ?: In['slot']) =>
            Required<In>['return'];

export type VFragment
    <In extends FragmentOptions = FragmentOptions> =
        (opts : VInput<In>, callback ?: In['slot']) => Required<In>['return'];

export type VExtension
    <In extends TagOptions<any>> =
        (opts : In extends TagOptions<infer K> ? VTagInput<K, In> : never, callback ?: In['slot']) =>
            Required<In>['return'];


interface Vasille {

    ref : typeof ref;
    expr : typeof expr;
    of : typeof valueOf;
    sv : typeof setValue;

    alwaysFalse : IValue<boolean>;

    text(text : string) : void;

    tag<K extends keyof AcceptedTagsMap>(
        name : string,
        opts : TagOptionsWithSlot<K>,
        callback : () => void
    ) : { node : (HTMLElementTagNameMap & SVGElementTagNameMap)[K] };

    app<In extends AppOptions<any>>(renderer: (opts : In) => Required<In>["return"])
        : (node: Element, opts : In) => Required<In>["return"];

    component<In extends TagOptions<any>>(renderer: (opts : In) => Required<In>["return"])
        : (opts : In, callback ?: In['slot']) => Required<In>["return"];

    fragment<In extends FragmentOptions>(renderer: (opts : In) => Required<In>["return"])
        : (opts : In, callback ?: In['slot']) => Required<In>["return"];

    extension<In extends TagOptions<any>>(renderer: (opts : In) => Required<In>["return"])
        : (opts : In, callback ?: In['slot']) => Required<In>["return"];

    reactive<In = void, Out = {}>(renderer : (opts: In) => Out)
        : (opts: In) => Out & {destructor: () => void};

    create<F extends Fragment>(
        node : F,
        input : F['input'],
        callback : (...args: ExtractParams<F['input']['slot']>) => void
    ) : F;

    if(condition: IValue<boolean>, callback: () => void) : void;
    else(callback: () => void) : void;
    elif(condition: IValue<boolean>, callback: () => void) : void;
    for<T, K>(model : ListenableModel<K, T>, callback : (value : T, index : K) => void) : void;
    watch<T>(model: IValue<T>, callback: (value : T) => void) : void;
    nextTick(callback: () => void) : void;

    destructor() : () => void;
    runOnDestroy(callback : () => void) : void;
}

export declare const v : Vasille;

declare global {
    namespace JSX {
        interface IntrinsicElements {

            // HTML

            "a": VJsxInput<"a">
            "abbr":VJsxInput<"abbr">
            "address": VJsxInput<"address">
            "area": VJsxInput<"area">
            "article": VJsxInput<"article">
            "aside": VJsxInput<"aside">
            "audio": VJsxInput<"audio">
            "b": VJsxInput<"b">
            "base": VJsxInput<"base">
            "bdi": VJsxInput<"bdi">
            "bdo": VJsxInput<"bdo">
            "blockquote": VJsxInput<"blockquote">
            "body": VJsxInput<"body">
            "br": VJsxInput<"br">
            "button": VJsxInput<"button">
            "canvas": VJsxInput<"canvas">
            "caption": VJsxInput<"caption">
            "cite": VJsxInput<"cite">
            "code": VJsxInput<"code">
            "col": VJsxInput<"col">
            "colgroup": VJsxInput<"colgroup">
            "data": VJsxInput<"data">
            "datalist": VJsxInput<"datalist">
            "dd": VJsxInput<"dd">
            "del": VJsxInput<"del">
            "details": VJsxInput<"details">
            "dfn": VJsxInput<"dfn">
            "dialog": VJsxInput<"dialog">
            "div": VJsxInput<"div">
            "dl": VJsxInput<"dl">
            "dt": VJsxInput<"dt">
            "em": VJsxInput<"em">
            "embed": VJsxInput<"embed">
            "fieldset": VJsxInput<"fieldset">
            "figcaption": VJsxInput<"figcaption">
            "figure": VJsxInput<"figure">
            "footer": VJsxInput<"footer">
            "form": VJsxInput<"form">
            "h1": VJsxInput<"h1">
            "h2": VJsxInput<"h2">
            "h3": VJsxInput<"h3">
            "h4": VJsxInput<"h4">
            "h5": VJsxInput<"h5">
            "h6": VJsxInput<"h6">
            "head": VJsxInput<"head">
            "header": VJsxInput<"header">
            "hgroup": VJsxInput<"hgroup">
            "hr": VJsxInput<"hr">
            "html": VJsxInput<"html">
            "i": VJsxInput<"i">
            "iframe": VJsxInput<"iframe">
            "img": VJsxInput<"img">
            "input": VJsxInput<"input">
            "ins": VJsxInput<"ins">
            "kbd": VJsxInput<"kbd">
            "label": VJsxInput<"label">
            "legend": VJsxInput<"legend">
            "li": VJsxInput<"li">
            "link": VJsxInput<"link">
            "main": VJsxInput<"main">
            "map": VJsxInput<"map">
            "mark": VJsxInput<"mark">
            "menu": VJsxInput<"menu">
            "meta": VJsxInput<"menu">
            "meter": VJsxInput<"meter">
            "nav": VJsxInput<"nav">
            "noscript": VJsxInput<"noscript">
            "object": VJsxInput<"object">
            "ol": VJsxInput<"ol">
            "optgroup": VJsxInput<"optgroup">
            "option": VJsxInput<"option">
            "output": VJsxInput<"output">
            "p": VJsxInput<"p">
            "param": VJsxInput<"param">
            "picture": VJsxInput<"picture">
            "pre": VJsxInput<"pre">
            "progress": VJsxInput<"progress">
            "q": VJsxInput<"q">
            "rp": VJsxInput<"rp">
            "rt": VJsxInput<"rt">
            "ruby": VJsxInput<"ruby">
            "s": VJsxInput<"s">
            "samp": VJsxInput<"samp">
            "script": VJsxInput<"script">
            "section": VJsxInput<"section">
            "select": VJsxInput<"select">
            "slot": VJsxInput<"slot">
            "small": VJsxInput<"small">
            "source": VJsxInput<"source">
            "span": VJsxInput<"span">
            "strong": VJsxInput<"strong">
            "style": VJsxInput<"style">
            "sub": VJsxInput<"sub">
            "summary": VJsxInput<"summary">
            "sup": VJsxInput<"sub">
            "table": VJsxInput<"table">
            "tbody": VJsxInput<"tbody">
            "td": VJsxInput<"td">
            "template": VJsxInput<"template">
            "textarea": VJsxInput<"textarea">
            "tfoot": VJsxInput<"tfoot">
            "th": VJsxInput<"th">
            "thead": VJsxInput<"thead">
            "time": VJsxInput<"time">
            "title": VJsxInput<"title">
            "tr": VJsxInput<"tr">
            "track": VJsxInput<"track">
            "u": VJsxInput<"u">
            "ul": VJsxInput<"ul">
            "var": VJsxInput<"var">
            "video": VJsxInput<"video">
            "wbr": VJsxInput<"wbr">

            // SVG

            "animate": VJsxInput<"animate">
            "animateMotion": VJsxInput<"animateMotion">
            "animateTransform": VJsxInput<"animateTransform">
            "circle": VJsxInput<"circle">
            "clipPath": VJsxInput<"clipPath">
            "defs": VJsxInput<"defs">
            "desc": VJsxInput<"desc">
            "ellipse": VJsxInput<"ellipse">
            "feBlend": VJsxInput<"feBlend">
            "feColorMatrix": VJsxInput<"feColorMatrix">
            "feComponentTransfer": VJsxInput<"feComponentTransfer">
            "feComposite": VJsxInput<"feComposite">
            "feConvolveMatrix": VJsxInput<"feConvolveMatrix">
            "feDiffuseLighting": VJsxInput<"feDiffuseLighting">
            "feDisplacementMap": VJsxInput<"feDisplacementMap">
            "feDistantLight": VJsxInput<"feDistantLight">
            "feDropShadow": VJsxInput<"feDropShadow">
            "feFlood": VJsxInput<"feFlood">
            "feFuncA": VJsxInput<"feFuncA">
            "feFuncB": VJsxInput<"feFuncB">
            "feFuncG": VJsxInput<"feFuncG">
            "feFuncR": VJsxInput<"feFuncR">
            "feGaussianBlur": VJsxInput<"feGaussianBlur">
            "feImage": VJsxInput<"feImage">
            "feMerge": VJsxInput<"feMerge">
            "feMergeNode": VJsxInput<"feMergeNode">
            "feMorphology": VJsxInput<"feMorphology">
            "feOffset": VJsxInput<"feOffset">
            "fePointLight": VJsxInput<"fePointLight">
            "feSpecularLighting": VJsxInput<"feSpecularLighting">
            "feSpotLight": VJsxInput<"feSpotLight">
            "feTile": VJsxInput<"feTile">
            "feTurbulence": VJsxInput<"feTurbulence">
            "filter": VJsxInput<"filter">
            "foreignObject": VJsxInput<"foreignObject">
            "g": VJsxInput<"g">
            "image": VJsxInput<"image">
            "line": VJsxInput<"line">
            "linearGradient": VJsxInput<"linearGradient">
            "marker": VJsxInput<"marker">
            "mask": VJsxInput<"mask">
            "metadata": VJsxInput<"metadata">
            "mpath": VJsxInput<"mpath">
            "path": VJsxInput<"path">
            "pattern": VJsxInput<"pattern">
            "polygon": VJsxInput<"polygon">
            "polyline": VJsxInput<"polyline">
            "radialGradient": VJsxInput<"radialGradient">
            "rect": VJsxInput<"rect">
            "set": VJsxInput<"set">
            "stop": VJsxInput<"stop">
            "svg": VJsxInput<"svg">
            "switch": VJsxInput<"switch">
            "symbol": VJsxInput<"symbol">
            "text": VJsxInput<"text">
            "textPath": VJsxInput<"textPath">
            "tspan": VJsxInput<"tspan">
            "use": VJsxInput<"use">
            "view": VJsxInput<"view">

            // Vasille

            "v-if": {
                model: IValue<boolean>
                slot?: () => void
            }
            "v-else": {
                model?: IValue<boolean>
                slot?: () => void
            }
            "v-elif": {
                model: IValue<boolean>
                slot?: () => void
            }
            "v-debug": {
                model: IValue<string>
            },
            "v-portal": {
                model: HTMLElement | SVGElement;
                slot?: () => void;
            }
        }
    }
}
