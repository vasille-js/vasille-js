import type { RawStyleProps } from "./spec/css.ts";
import type { HtmlTagMap } from "./spec/html.ts";

type prefixedObject<T, P extends string> = {
    [K in keyof T as K extends string ? `${P}${K}` : never]?: T[K];
};
type EventHandlers<T> = {
    [K in keyof T]: T[K] | [T[K], boolean | AddEventListenerOptions];
};

export type ClassItem = string | Record<string, boolean> | false;

type HtmlInput<K extends keyof HTMLElementTagNameMap & keyof HtmlTagMap> = {
    callback?: (node: HTMLElementTagNameMap[K]) => unknown;
    class?: ClassItem[] | string;
    style?: RawStyleProps | string;
    slot?: unknown;
} & Partial<HtmlTagMap[K]["attrs"]> &
    prefixedObject<EventHandlers<HtmlTagMap[K]["events"]>, "on"> &
    Partial<prefixedObject<HtmlTagMap[K]["props"], "bind:">>;

export declare namespace JSX {
    // Valid JSX tags: all the valid lowercase tags and function components
    type ElementType = keyof IntrinsicElements | ((props: any) => void);
    type Element = never;
    type ElementClass = never;

    interface ElementChildrenAttribute {
        slot: unknown;
    }

    interface IntrinsicElements {
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
    }
}
