import type { Pointer } from "vasille";
import type { ArrayModel, MapModel, SetModel } from "vasille";
import type { Fragment, IValue } from "vasille";
import type { HtmlTagMap, SvgTagMap } from "vasille-jsx";
import type {
    StandardPropertiesHyphen,
    VendorPropertiesHyphen,
    ObsoletePropertiesHyphen,
    SvgPropertiesHyphen,
} from "csstype";

declare interface CoreProps {
    slot?: (...args: unknown[]) => unknown;
}

declare type ReactiveFields<T extends object> = {
    [K in keyof T]: T[K] extends IValue<unknown> ? T[K] : IValue<T[K]>;
};

declare type MaybeReactiveFields<T extends object> = {
    [K in keyof T]: T[K] | IValue<T[K]>;
};

declare type Composed<In extends CoreProps, Out> = (
    this: Fragment,
    $: MaybeReactiveFields<In> & { callback?(data: Out | undefined): void },
    slot?: In["slot"],
) => void;

declare function compose<In extends CoreProps, Out = void>(renderer: (input: ReactiveFields<In>) => Out): Composed<In, Out>;

declare function extend<In extends CoreProps, Out = void>(renderer: (input: ReactiveFields<In>) => Out): Composed<In, Out>;

declare function mount<T>(tag: Element, component: ($: T) => unknown, $: T): void;

declare function ref<T>(v: T): IValue<T>;
declare function forward<T>(v: IValue<T>): IValue<T>;
declare function own<T>(v: IValue<T>): Pointer<T>;
declare function bind<T>(v: T): IValue<T>;
declare function calculate<T>(fn: () => T): IValue<T>;
declare function arrayModel<T>(v?: T[]): ArrayModel<T>;
declare function setModel<T>(v?: T[]): SetModel<T>;
declare function mapModel<K, T>(v?: [K, T][]): MapModel<K, T>;
declare function reactiveFields<T extends object>(o: T): ReactiveFields<T>;

declare function Adapter(props: { node: Fragment; slot?: () => void }): void;

declare function Slot<Args extends never[] | [object]>(
    options: {
        model?: (...args: Args) => void;
        slot?: () => void;
    } & (Args extends never[] ? {} : Args[0]),
): void;

declare function If(props: { condition: IValue<unknown>; slot?: () => void }): void;

declare function ElseIf(props: { condition: IValue<unknown>; slot?: () => void }): void;

declare function Else(props: { slot?: () => void }): void;

declare function For<T>(props: { of: ArrayModel<T>; slot?: (value: T) => void }): void;
declare function For<T>(props: { of: SetModel<T>; slot?: (value: T) => void }): void;
declare function For<K, T>(props: { of: MapModel<K, T>; slot?: (value: T, index: K) => void }): void;

declare function Watch<T>(props: { model: IValue<T>; slot?: (value: T) => void }): void;

declare function Debug(props: { model: unknown }): void;

declare function Mount(props: { bind: IValue<unknown> }): void;

declare function Show(props: { bind: IValue<unknown> }): void;

declare function Delay(props: { time?: number; slot?: () => void }): void;

declare function forward<T extends IValue<unknown>>(value: T): T;

declare function calculate<T>(f: () => T): IValue<T>;

declare function watch(f: () => void): void;

declare function awaited<T>(target: Promise<T>): [IValue<unknown>, IValue<T | undefined>];
declare function awaited<T>(target: () => Promise<T>): [IValue<unknown>, IValue<T | undefined>];

// jsx types

type prefixedObject<T, P extends string> = {
    [K in keyof T as K extends string ? `${P}${K}` : never]?: T[K];
};

type HtmlClasses = (string | IValue<string> | Record<string, IValue<boolean>> | false)[] | string | IValue<string>;

type HtmlInput<K extends keyof HTMLElementTagNameMap & keyof HtmlTagMap> = {
    callback?: (node: HTMLElementTagNameMap[K]) => unknown;
    class?: HtmlClasses;
    style?: MaybeReactiveFields<
        StandardPropertiesHyphen<
            string | number | number[] | IValue<string | number | number[]>,
            string | IValue<string>
        > & VendorPropertiesHyphen<
            string | number | number[] | IValue<string | number | number[]>,
            string | IValue<string>
        > & ObsoletePropertiesHyphen<
            string | number | number[] | IValue<string | number | number[]>,
            string | IValue<string>
        >
    >;
    slot?: unknown;
} & Partial<MaybeReactiveFields<HtmlTagMap[K]["attrs"]>> &
    prefixedObject<HtmlTagMap[K]["events"], "on"> & { [K in `bind:${string}`]?: unknown };

type SvgInput<K extends keyof SVGElementTagNameMap> = {
    callback?: (node: SVGElementTagNameMap[K]) => unknown;
    class?: HtmlClasses;
    style?: MaybeReactiveFields<SvgPropertiesHyphen<
        string | number | number[] | IValue<string | number | number[]>,
        string | IValue<string>
    >>;
    slot?: unknown;
} & Partial<MaybeReactiveFields<SvgTagMap[K]["attrs"]>> &
    prefixedObject<SvgTagMap[K]["events"], "on"> & { [K in `bind:${string}`]?: unknown };

// document.createElement()

declare global {
    namespace JSX {
        // Valid JSX tags: all the valid lowercase tags and function components
        type ElementType = keyof IntrinsicElements | ((props?: object) => void);
        type Element = never;
        type ElementClass = never;
        interface ElementChildrenAttribute {
            slot: (...args: unknown[]) => unknown;
        }
        interface IntrinsicElements {
            // HTML

            a: HtmlInput<"a">;
            abbr: HtmlInput<"abbr">;
            address: HtmlInput<"address">;
            area: HtmlInput<"area">;
            article: HtmlInput<"article">;
            aside: HtmlInput<"aside">;
            audio: HtmlInput<"audio">;
            b: HtmlInput<"b">;
            base: HtmlInput<"base">;
            bdi: HtmlInput<"bdi">;
            bdo: HtmlInput<"bdo">;
            blockquote: HtmlInput<"blockquote">;
            body: HtmlInput<"body">;
            br: HtmlInput<"br">;
            button: HtmlInput<"button">;
            canvas: HtmlInput<"canvas">;
            caption: HtmlInput<"caption">;
            cite: HtmlInput<"cite">;
            code: HtmlInput<"code">;
            col: HtmlInput<"col">;
            colgroup: HtmlInput<"colgroup">;
            data: HtmlInput<"data">;
            datalist: HtmlInput<"datalist">;
            dd: HtmlInput<"dd">;
            del: HtmlInput<"del">;
            details: HtmlInput<"details">;
            dfn: HtmlInput<"dfn">;
            dialog: HtmlInput<"dialog">;
            div: HtmlInput<"div">;
            dl: HtmlInput<"dl">;
            dt: HtmlInput<"dt">;
            em: HtmlInput<"em">;
            embed: HtmlInput<"embed">;
            fieldset: HtmlInput<"fieldset">;
            figcaption: HtmlInput<"figcaption">;
            figure: HtmlInput<"figure">;
            footer: HtmlInput<"footer">;
            form: HtmlInput<"form">;
            h1: HtmlInput<"h1">;
            h2: HtmlInput<"h2">;
            h3: HtmlInput<"h3">;
            h4: HtmlInput<"h4">;
            h5: HtmlInput<"h5">;
            h6: HtmlInput<"h6">;
            head: HtmlInput<"head">;
            header: HtmlInput<"header">;
            hgroup: HtmlInput<"hgroup">;
            hr: HtmlInput<"hr">;
            html: HtmlInput<"html">;
            i: HtmlInput<"i">;
            iframe: HtmlInput<"iframe">;
            img: HtmlInput<"img">;
            input: HtmlInput<"input">;
            ins: HtmlInput<"ins">;
            kbd: HtmlInput<"kbd">;
            label: HtmlInput<"label">;
            legend: HtmlInput<"legend">;
            li: HtmlInput<"li">;
            link: HtmlInput<"link">;
            main: HtmlInput<"main">;
            map: HtmlInput<"map">;
            mark: HtmlInput<"mark">;
            menu: HtmlInput<"menu">;
            meta: HtmlInput<"meta">;
            meter: HtmlInput<"meter">;
            nav: HtmlInput<"nav">;
            noscript: HtmlInput<"noscript">;
            object: HtmlInput<"object">;
            ol: HtmlInput<"ol">;
            optgroup: HtmlInput<"optgroup">;
            option: HtmlInput<"option">;
            output: HtmlInput<"output">;
            p: HtmlInput<"p">;
            picture: HtmlInput<"picture">;
            pre: HtmlInput<"pre">;
            progress: HtmlInput<"progress">;
            q: HtmlInput<"q">;
            rp: HtmlInput<"rp">;
            rt: HtmlInput<"rt">;
            ruby: HtmlInput<"ruby">;
            s: HtmlInput<"s">;
            samp: HtmlInput<"samp">;
            script: HtmlInput<"script">;
            section: HtmlInput<"section">;
            select: HtmlInput<"select">;
            slot: HtmlInput<"slot">;
            small: HtmlInput<"small">;
            source: HtmlInput<"source">;
            span: HtmlInput<"span">;
            strong: HtmlInput<"strong">;
            style: HtmlInput<"style">;
            sub: HtmlInput<"sub">;
            summary: HtmlInput<"summary">;
            sup: HtmlInput<"sub">;
            table: HtmlInput<"table">;
            tbody: HtmlInput<"tbody">;
            td: HtmlInput<"td">;
            template: HtmlInput<"template">;
            textarea: HtmlInput<"textarea">;
            tfoot: HtmlInput<"tfoot">;
            th: HtmlInput<"th">;
            thead: HtmlInput<"thead">;
            time: HtmlInput<"time">;
            title: HtmlInput<"title">;
            tr: HtmlInput<"tr">;
            track: HtmlInput<"track">;
            u: HtmlInput<"u">;
            ul: HtmlInput<"ul">;
            var: HtmlInput<"var">;
            video: HtmlInput<"video">;
            wbr: HtmlInput<"wbr">;

            // SVG

            animate: SvgInput<"animate">;
            animateMotion: SvgInput<"animateMotion">;
            animateTransform: SvgInput<"animateTransform">;
            circle: SvgInput<"circle">;
            clipPath: SvgInput<"clipPath">;
            defs: SvgInput<"defs">;
            desc: SvgInput<"desc">;
            ellipse: SvgInput<"ellipse">;
            feBlend: SvgInput<"feBlend">;
            feColorMatrix: SvgInput<"feColorMatrix">;
            feComponentTransfer: SvgInput<"feComponentTransfer">;
            feComposite: SvgInput<"feComposite">;
            feConvolveMatrix: SvgInput<"feConvolveMatrix">;
            feDiffuseLighting: SvgInput<"feDiffuseLighting">;
            feDisplacementMap: SvgInput<"feDisplacementMap">;
            feDistantLight: SvgInput<"feDistantLight">;
            feDropShadow: SvgInput<"feDropShadow">;
            feFlood: SvgInput<"feFlood">;
            feFuncA: SvgInput<"feFuncA">;
            feFuncB: SvgInput<"feFuncB">;
            feFuncG: SvgInput<"feFuncG">;
            feFuncR: SvgInput<"feFuncR">;
            feGaussianBlur: SvgInput<"feGaussianBlur">;
            feImage: SvgInput<"feImage">;
            feMerge: SvgInput<"feMerge">;
            feMergeNode: SvgInput<"feMergeNode">;
            feMorphology: SvgInput<"feMorphology">;
            feOffset: SvgInput<"feOffset">;
            fePointLight: SvgInput<"fePointLight">;
            feSpecularLighting: SvgInput<"feSpecularLighting">;
            feSpotLight: SvgInput<"feSpotLight">;
            feTile: SvgInput<"feTile">;
            feTurbulence: SvgInput<"feTurbulence">;
            filter: SvgInput<"filter">;
            foreignObject: SvgInput<"foreignObject">;
            g: SvgInput<"g">;
            image: SvgInput<"image">;
            line: SvgInput<"line">;
            linearGradient: SvgInput<"linearGradient">;
            marker: SvgInput<"marker">;
            mask: SvgInput<"mask">;
            metadata: SvgInput<"metadata">;
            mpath: SvgInput<"mpath">;
            path: SvgInput<"path">;
            pattern: SvgInput<"pattern">;
            polygon: SvgInput<"polygon">;
            polyline: SvgInput<"polyline">;
            radialGradient: SvgInput<"radialGradient">;
            rect: SvgInput<"rect">;
            set: SvgInput<"set">;
            stop: SvgInput<"stop">;
            svg: SvgInput<"svg">;
            switch: SvgInput<"switch">;
            symbol: SvgInput<"symbol">;
            text: SvgInput<"text">;
            textPath: SvgInput<"textPath">;
            tspan: SvgInput<"tspan">;
            use: SvgInput<"use">;
            view: SvgInput<"view">;
        }
    }
}
