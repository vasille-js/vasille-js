export type EventHandler<T> = (ev: T) => any;

export interface Tag<Attrs, Events> {
    attrs: Attrs;
    events: Events;
}

type TagEvents = {
    [K in keyof HTMLElementEventMap]: EventHandler<HTMLElementEventMap[K]> | undefined;
};

interface TagAttrs {
    id: string;
    accesskey: string;
    autocapitalize: "off" | "none" | "on" | "sentences" | "words" | "characters";
    autofocus: "" | boolean;
    contenteditable: "true" | "false" | "" | boolean;
    dir: "ltr" | "rtl" | "auto";
    draggable: "true" | "false" | "" | boolean;
    enterkeyhint: "enter" | "done" | "go" | "next" | "previous" | "search" | "send";
    hidden: "until-found" | "hidden" | "" | boolean;
    inert: boolean;
    inputmode: "none" | "text" | "tel" | "url" | "email" | "numeric" | "decimal" | "search";
    is: string;
    itemid: string;
    itemprop: string;
    itemref: string;
    itemscope: boolean;
    itemtype: string;
    lang: string;
    nonce: string;
    spellcheck: "true" | "false" | "" | boolean;
    tabindex: number;
    title: string;
    translate: "yes" | "no" | "" | boolean;
}

interface MediaTagAttrs extends TagAttrs {
    src: string;
    crossorigin: "anonymous" | "use-credentials" | "" | boolean;
    preload: "none" | "metadata" | "auto";
    autoplay: boolean;
    loop: boolean;
    muted: boolean;
    controls: boolean;
}

type MediaEvents = {
    [K in keyof HTMLMediaElementEventMap]: EventHandler<HTMLMediaElementEventMap[K]> | undefined;
};

type VideoEvents = {
    [K in keyof HTMLVideoElementEventMap]: EventHandler<HTMLVideoElementEventMap[K]> | undefined;
};

interface BaseAttrs extends TagAttrs {
    href: string;
    target: string;
}

interface LinkAttrs extends TagAttrs {
    href: string;
    crossorigin: "anonymous" | "use-credentials" | "" | boolean;
    rel: string;
    media: string;
    integrity: string;
    hreflang: string;
    type: string;
    referrerpolicy: string;
    sizes: string;
    imagesrcset: string;
    imagesizes: string;
    as: string;
    blocking: boolean;
    color: string;
}

interface MetaAttrs extends TagAttrs {
    name: string;
    "http-equiv": string;
    content: string;
    charset: string;
    media: string;
}

interface StyleAttrs extends TagAttrs {
    media: string;
    blocking: string;
}

type BodyEvents = {
    [K in keyof HTMLBodyElementEventMap]: EventHandler<HTMLBodyElementEventMap[K]> | undefined;
};

interface BlockQuoteAttrs extends TagAttrs {
    cite: string;
}

interface OlAttrs extends TagAttrs {
    reversed: boolean;
    start: number;
    type: "1" | "a" | "A" | "i" | "I";
}

interface AAttrs extends TagAttrs {
    href: string;
    target: string;
    download: string;
    ping: string;
    hreflang: string;
    type: string;
    referrerpolicy: string;
}

interface QAttrs extends TagAttrs {
    cite: string;
}

interface DataAttr extends TagAttrs {
    value: string;
}

interface BdoAttrs extends TagAttrs {
    dir: "ltr" | "rtl";
}

interface SourceAttrs extends TagAttrs {
    type: string;
    src: string;
    srcset: string;
    sizes: string;
    media: string;
    width: number;
    height: number;
}

interface ImgAttrs extends TagAttrs {
    alt: string;
    src: string;
    srcset: string;
    sizes: string;
    crossorigin: "anonymous" | "use-credentials" | "" | boolean;
    usemap: string;
    ismap: string;
    width: number;
    height: number;
    referrerpolicy: string;
    decoding: string;
    loading: string;
}

interface IframeAttrs extends TagAttrs {
    src: string;
    srcdoc: string;
    name: string;
    sandbox: string;
    allow: string;
    allowfullscreen: string;
    width: number;
    height: number;
    referrerpolicy: string;
    loading: string;
}

interface EmbedAttrs extends TagAttrs {
    src: string;
    type: string;
    width: number;
    height: number;
}

interface ObjectAttrs extends TagAttrs {
    data: string;
    type: string;
    name: string;
    form: string;
    width: number;
    height: number;
}

interface ParamAttrs extends TagAttrs {
    name: string;
    value: string;
}

interface VideoAttrs extends MediaTagAttrs {
    poster: string;
    playsinline: boolean;
    width: number;
    height: number;
}

interface TrackAttrs extends TagAttrs {
    kind: string;
    src: string;
    srclang: string;
    label: string;
    defautl: boolean;
}

interface MapAttrs extends TagAttrs {
    name: string;
}

interface AreaAttrs extends TagAttrs {
    alt: string;
    coords: string;
    shape: string;
    href: string;
    target: string;
    download: string;
    ping: string;
    rel: string;
    referrerpolicy: string;
}

interface ColAttrs extends TagAttrs {
    span: number;
}

interface TdAttrs extends TagAttrs {
    colspan: number;
    rowspan: number;
    headers: string;
}

interface ThAttrs extends TdAttrs {
    scope: string;
    abbr: string;
}

interface FormAttrs extends TagAttrs {
    "accept-charset": string;
    action: string;
    autocomplete: string;
    enctype: string;
    method: string;
    name: string;
    novalidate: string;
    target: string;
    rel: string;
}

interface LabelAttrs extends TagAttrs {
    for: string;
}

interface InputAttrs extends TagAttrs {
    accept: string;
    alt: string;
    autocomplete: boolean;
    checked: boolean;
    dirname: string;
    disabled: boolean;
    form: string;
    formaction: string;
    formenctype: string;
    formmethod: string;
    formnovalidate: string;
    formtarget: string;
    height: number;
    list: string;
    max: number;
    maxlength: number;
    min: number;
    minlength: number;
    multiple: boolean;
    name: string;
    pattern: string;
    placeholder: string;
    readonly: string;
    required: string;
    size: number;
    src: string;
    step: string;
    type: string;
    width: number;
}

interface ButtonAttrs extends TagAttrs {
    disabled: boolean;
    form: string;
    formaction: string;
    formenctype: string;
    formmethod: string;
    formnovalidate: string;
    formtarget: string;
    name: string;
    type: string;
    value: string;
}

interface SelectAttrs extends TagAttrs {
    autocomplete: boolean;
    disabled: boolean;
    form: string;
    multiple: boolean;
    name: string;
    required: boolean;
    size: number;
}

interface OptgroupAttrs extends TagAttrs {
    disabled: boolean;
    label: string;
}

interface OptionAttrs extends TagAttrs {
    disabled: boolean;
    label: string;
    selected: boolean;
    value: string;
}

interface TextareaAttrs extends TagAttrs {
    autocomplete: boolean;
    cols: number;
    dirname: string;
    disabled: boolean;
    form: string;
    maxlength: number;
    minlength: number;
    name: string;
    placeholder: string;
    readonly: boolean;
    required: boolean;
    rows: number;
    wrap: string;
}

interface OutputAttrs extends TagAttrs {
    for: string;
    form: string;
    name: string;
}

interface ProgressAttrs extends TagAttrs {
    value: number;
    max: number;
}

interface MeterAttrs extends TagAttrs {
    value: number;
    min: number;
    max: number;
    low: number;
    high: number;
    optimum: number;
}

interface FieldsetAttrs extends TagAttrs {
    disabled: boolean;
    form: string;
    name: string;
}

interface DetailsAttrs extends TagAttrs {
    open: boolean;
}

export interface HtmlTagMap {
    a: Tag<AAttrs, TagEvents>;
    abbr: Tag<TagAttrs, TagEvents>;
    address: Tag<TagAttrs, TagEvents>;
    area: Tag<AreaAttrs, TagEvents>;
    article: Tag<TagAttrs, TagEvents>;
    aside: Tag<TagAttrs, TagEvents>;
    audio: Tag<MediaTagAttrs, MediaEvents>;
    b: Tag<TagAttrs, TagEvents>;
    base: Tag<BaseAttrs, TagEvents>;
    bdi: Tag<TagAttrs, TagEvents>;
    bdo: Tag<BdoAttrs, TagEvents>;
    blockquote: Tag<BlockQuoteAttrs, TagEvents>;
    body: Tag<TagAttrs, BodyEvents>;
    br: Tag<TagAttrs, TagEvents>;
    button: Tag<ButtonAttrs, TagEvents>;
    canvas: Tag<TagAttrs, TagEvents>;
    caption: Tag<TagAttrs, TagEvents>;
    cite: Tag<TagAttrs, TagEvents>;
    code: Tag<TagAttrs, TagEvents>;
    col: Tag<ColAttrs, TagEvents>;
    colgroup: Tag<ColAttrs, TagEvents>;
    data: Tag<DataAttr, TagEvents>;
    datalist: Tag<TagAttrs, TagEvents>;
    dd: Tag<TagAttrs, TagEvents>;
    del: Tag<TagAttrs, TagEvents>;
    details: Tag<DetailsAttrs, TagEvents>;
    dfn: Tag<TagAttrs, TagEvents>;
    dialog: Tag<TagAttrs, TagEvents>;
    dir: Tag<TagAttrs, TagEvents>;
    div: Tag<TagAttrs, TagEvents>;
    dl: Tag<TagAttrs, TagEvents>;
    dt: Tag<TagAttrs, TagEvents>;
    em: Tag<TagAttrs, TagEvents>;
    embed: Tag<EmbedAttrs, TagEvents>;
    fieldset: Tag<FieldsetAttrs, TagEvents>;
    figcaption: Tag<TagAttrs, TagEvents>;
    figure: Tag<TagAttrs, TagEvents>;
    font: Tag<TagAttrs, TagEvents>;
    footer: Tag<TagAttrs, TagEvents>;
    form: Tag<FormAttrs, TagEvents>;
    frame: Tag<TagAttrs, TagEvents>;
    frameset: Tag<TagAttrs, TagEvents>;
    h1: Tag<TagAttrs, TagEvents>;
    h2: Tag<TagAttrs, TagEvents>;
    h3: Tag<TagAttrs, TagEvents>;
    h4: Tag<TagAttrs, TagEvents>;
    h5: Tag<TagAttrs, TagEvents>;
    h6: Tag<TagAttrs, TagEvents>;
    head: Tag<TagAttrs, TagEvents>;
    header: Tag<TagAttrs, TagEvents>;
    hgroup: Tag<TagAttrs, TagEvents>;
    hr: Tag<TagAttrs, TagEvents>;
    html: Tag<TagAttrs, TagEvents>;
    i: Tag<TagAttrs, TagEvents>;
    iframe: Tag<IframeAttrs, TagEvents>;
    img: Tag<ImgAttrs, TagEvents>;
    input: Tag<InputAttrs, TagEvents>;
    ins: Tag<TagAttrs, TagEvents>;
    kbd: Tag<TagAttrs, TagEvents>;
    label: Tag<LabelAttrs, TagEvents>;
    legend: Tag<TagAttrs, TagEvents>;
    li: Tag<TagAttrs, TagEvents>;
    link: Tag<LinkAttrs, TagEvents>;
    main: Tag<TagAttrs, TagEvents>;
    map: Tag<MapAttrs, TagEvents>;
    mark: Tag<TagAttrs, TagEvents>;
    marquee: Tag<TagAttrs, TagEvents>;
    menu: Tag<TagAttrs, TagEvents>;
    meta: Tag<MetaAttrs, TagEvents>;
    meter: Tag<MeterAttrs, TagEvents>;
    nav: Tag<TagAttrs, TagEvents>;
    noscript: Tag<TagAttrs, TagEvents>;
    object: Tag<ObjectAttrs, TagEvents>;
    ol: Tag<OlAttrs, TagEvents>;
    optgroup: Tag<OptgroupAttrs, TagEvents>;
    option: Tag<OptionAttrs, TagEvents>;
    output: Tag<OutputAttrs, TagEvents>;
    p: Tag<TagAttrs, TagEvents>;
    param: Tag<ParamAttrs, TagEvents>;
    picture: Tag<TagAttrs, TagEvents>;
    pre: Tag<TagAttrs, TagEvents>;
    progress: Tag<ProgressAttrs, TagEvents>;
    q: Tag<QAttrs, TagEvents>;
    rp: Tag<TagAttrs, TagEvents>;
    rt: Tag<TagAttrs, TagEvents>;
    ruby: Tag<TagAttrs, TagEvents>;
    s: Tag<TagAttrs, TagEvents>;
    samp: Tag<TagAttrs, TagEvents>;
    script: Tag<TagAttrs, TagEvents>;
    section: Tag<TagAttrs, TagEvents>;
    select: Tag<SelectAttrs, TagEvents>;
    slot: Tag<TagAttrs, TagEvents>;
    small: Tag<TagAttrs, TagEvents>;
    source: Tag<SourceAttrs, TagEvents>;
    span: Tag<TagAttrs, TagEvents>;
    strong: Tag<TagAttrs, TagEvents>;
    style: Tag<StyleAttrs, TagEvents>;
    sub: Tag<TagAttrs, TagEvents>;
    summary: Tag<TagAttrs, TagEvents>;
    sup: Tag<TagAttrs, TagEvents>;
    table: Tag<TagAttrs, TagEvents>;
    tbody: Tag<TagAttrs, TagEvents>;
    td: Tag<TdAttrs, TagEvents>;
    template: Tag<TagAttrs, TagEvents>;
    textarea: Tag<TextareaAttrs, TagEvents>;
    tfoot: Tag<TagAttrs, TagEvents>;
    th: Tag<ThAttrs, TagEvents>;
    thead: Tag<TagAttrs, TagEvents>;
    time: Tag<TagAttrs, TagEvents>;
    title: Tag<TagAttrs, TagEvents>;
    tr: Tag<TagAttrs, TagEvents>;
    track: Tag<TrackAttrs, TagEvents>;
    u: Tag<TagAttrs, TagEvents>;
    ul: Tag<TagAttrs, TagEvents>;
    var: Tag<TagAttrs, TagEvents>;
    video: Tag<VideoAttrs, VideoEvents>;
    wbr: Tag<TagAttrs, TagEvents>;
    [K: string]: Tag<TagAttrs, TagEvents>;
}

type HtmlOrSvgTag = HTMLElement | SVGElement;

export interface HtmlAndSvgEvents {
    onabort?: ((this: HtmlOrSvgTag, ev: UIEvent) => any) | null;
    onanimationcancel?: ((this: HtmlOrSvgTag, ev: AnimationEvent) => any) | null;
    onanimationend?: ((this: HtmlOrSvgTag, ev: AnimationEvent) => any) | null;
    onanimationiteration?: ((this: HtmlOrSvgTag, ev: AnimationEvent) => any) | null;
    onanimationstart?: ((this: HtmlOrSvgTag, ev: AnimationEvent) => any) | null;
    onauxclick?: ((this: HtmlOrSvgTag, ev: MouseEvent) => any) | null;
    onblur?: ((this: HtmlOrSvgTag, ev: FocusEvent) => any) | null;
    oncanplay?: ((this: HtmlOrSvgTag, ev: Event) => any) | null;
    oncanplaythrough?: ((this: HtmlOrSvgTag, ev: Event) => any) | null;
    onchange?: ((this: HtmlOrSvgTag, ev: Event) => any) | null;
    onclick?: ((this: HtmlOrSvgTag, ev: MouseEvent) => any) | null;
    onclose?: ((this: HtmlOrSvgTag, ev: Event) => any) | null;
    oncontextmenu?: ((this: HtmlOrSvgTag, ev: MouseEvent) => any) | null;
    oncopy?: ((this: HtmlOrSvgTag, ev: ClipboardEvent) => any) | null;
    oncut?: ((this: HtmlOrSvgTag, ev: ClipboardEvent) => any) | null;
    oncuechange?: ((this: HtmlOrSvgTag, ev: Event) => any) | null;
    ondblclick?: ((this: HtmlOrSvgTag, ev: MouseEvent) => any) | null;
    ondrag?: ((this: HtmlOrSvgTag, ev: DragEvent) => any) | null;
    ondragend?: ((this: HtmlOrSvgTag, ev: DragEvent) => any) | null;
    ondragenter?: ((this: HtmlOrSvgTag, ev: DragEvent) => any) | null;
    ondragleave?: ((this: HtmlOrSvgTag, ev: DragEvent) => any) | null;
    ondragover?: ((this: HtmlOrSvgTag, ev: DragEvent) => any) | null;
    ondragstart?: ((this: HtmlOrSvgTag, ev: DragEvent) => any) | null;
    ondrop?: ((this: HtmlOrSvgTag, ev: DragEvent) => any) | null;
    ondurationchange?: ((this: HtmlOrSvgTag, ev: Event) => any) | null;
    onemptied?: ((this: HtmlOrSvgTag, ev: Event) => any) | null;
    onended?: ((this: HtmlOrSvgTag, ev: Event) => any) | null;
    onerror?: ((event: Event | string, source?: string, lineno?: number, colno?: number, error?: Error) => any) | null;
    onfocus?: ((this: HtmlOrSvgTag, ev: FocusEvent) => any) | null;
    onformdata?: ((this: HtmlOrSvgTag, ev: FormDataEvent) => any) | null;
    onfullscreenchange?: ((this: HtmlOrSvgTag, ev: Event) => any) | null;
    onfullscreenerror?: ((this: HtmlOrSvgTag, ev: Event) => any) | null;
    ongotpointercapture?: ((this: HtmlOrSvgTag, ev: PointerEvent) => any) | null;
    oninput?: ((this: HtmlOrSvgTag, ev: Event) => any) | null;
    oninvalid?: ((this: HtmlOrSvgTag, ev: Event) => any) | null;
    onkeydown?: ((this: HtmlOrSvgTag, ev: KeyboardEvent) => any) | null;
    onkeypress?: ((this: HtmlOrSvgTag, ev: KeyboardEvent) => any) | null;
    onkeyup?: ((this: HtmlOrSvgTag, ev: KeyboardEvent) => any) | null;
    onload?: ((this: HtmlOrSvgTag, ev: Event) => any) | null;
    onloadeddata?: ((this: HtmlOrSvgTag, ev: Event) => any) | null;
    onloadedmetadata?: ((this: HtmlOrSvgTag, ev: Event) => any) | null;
    onloadstart?: ((this: HtmlOrSvgTag, ev: Event) => any) | null;
    onlostpointercapture?: ((this: HtmlOrSvgTag, ev: PointerEvent) => any) | null;
    onmousedown?: ((this: HtmlOrSvgTag, ev: MouseEvent) => any) | null;
    onmouseenter?: ((this: HtmlOrSvgTag, ev: MouseEvent) => any) | null;
    onmouseleave?: ((this: HtmlOrSvgTag, ev: MouseEvent) => any) | null;
    onmousemove?: ((this: HtmlOrSvgTag, ev: MouseEvent) => any) | null;
    onmouseout?: ((this: HtmlOrSvgTag, ev: MouseEvent) => any) | null;
    onmouseover?: ((this: HtmlOrSvgTag, ev: MouseEvent) => any) | null;
    onmouseup?: ((this: HtmlOrSvgTag, ev: MouseEvent) => any) | null;
    onpaste?: ((this: HtmlOrSvgTag, ev: ClipboardEvent) => any) | null;
    onpause?: ((this: HtmlOrSvgTag, ev: Event) => any) | null;
    onplay?: ((this: HtmlOrSvgTag, ev: Event) => any) | null;
    onplaying?: ((this: HtmlOrSvgTag, ev: Event) => any) | null;
    onpointercancel?: ((this: HtmlOrSvgTag, ev: PointerEvent) => any) | null;
    onpointerdown?: ((this: HtmlOrSvgTag, ev: PointerEvent) => any) | null;
    onpointerenter?: ((this: HtmlOrSvgTag, ev: PointerEvent) => any) | null;
    onpointerleave?: ((this: HtmlOrSvgTag, ev: PointerEvent) => any) | null;
    onpointermove?: ((this: HtmlOrSvgTag, ev: PointerEvent) => any) | null;
    onpointerout?: ((this: HtmlOrSvgTag, ev: PointerEvent) => any) | null;
    onpointerover?: ((this: HtmlOrSvgTag, ev: PointerEvent) => any) | null;
    onpointerup?: ((this: HtmlOrSvgTag, ev: PointerEvent) => any) | null;
    onprogress?: ((this: HtmlOrSvgTag, ev: ProgressEvent) => any) | null;
    onratechange?: ((this: HtmlOrSvgTag, ev: Event) => any) | null;
    onreset?: ((this: HtmlOrSvgTag, ev: Event) => any) | null;
    onresize?: ((this: HtmlOrSvgTag, ev: UIEvent) => any) | null;
    onscroll?: ((this: HtmlOrSvgTag, ev: Event) => any) | null;
    onseeked?: ((this: HtmlOrSvgTag, ev: Event) => any) | null;
    onseeking?: ((this: HtmlOrSvgTag, ev: Event) => any) | null;
    onselect?: ((this: HtmlOrSvgTag, ev: Event) => any) | null;
    onselectionchange?: ((this: HtmlOrSvgTag, ev: Event) => any) | null;
    onselectstart?: ((this: HtmlOrSvgTag, ev: Event) => any) | null;
    onstalled?: ((this: HtmlOrSvgTag, ev: Event) => any) | null;
    onsubmit?: ((this: HtmlOrSvgTag, ev: SubmitEvent) => any) | null;
    onsuspend?: ((this: HtmlOrSvgTag, ev: Event) => any) | null;
    ontimeupdate?: ((this: HtmlOrSvgTag, ev: Event) => any) | null;
    ontoggle?: ((this: HtmlOrSvgTag, ev: Event) => any) | null;
    ontouchcancel?: ((this: HtmlOrSvgTag, ev: TouchEvent) => any) | null | undefined;
    ontouchend?: ((this: HtmlOrSvgTag, ev: TouchEvent) => any) | null | undefined;
    ontouchmove?: ((this: HtmlOrSvgTag, ev: TouchEvent) => any) | null | undefined;
    ontouchstart?: ((this: HtmlOrSvgTag, ev: TouchEvent) => any) | null | undefined;
    ontransitioncancel?: ((this: HtmlOrSvgTag, ev: TransitionEvent) => any) | null;
    ontransitionend?: ((this: HtmlOrSvgTag, ev: TransitionEvent) => any) | null;
    ontransitionrun?: ((this: HtmlOrSvgTag, ev: TransitionEvent) => any) | null;
    ontransitionstart?: ((this: HtmlOrSvgTag, ev: TransitionEvent) => any) | null;
    onvolumechange?: ((this: HtmlOrSvgTag, ev: Event) => any) | null;
    onwaiting?: ((this: HtmlOrSvgTag, ev: Event) => any) | null;
    onwheel?: ((this: HtmlOrSvgTag, ev: WheelEvent) => any) | null;
}

interface HtmlTag extends HtmlAndSvgEvents {
    autofocus?: boolean;
    className?: string;
    nonce?: string | undefined;
    tabIndex?: number;
    accessKey?: string;
    autocapitalize?: string;
    dir?: string;
    draggable?: boolean;
    hidden?: boolean;
    innerText?: string;
    lang?: string;
    outerText?: string;
    spellcheck?: boolean;
    title?: string;
    translate?: boolean;
}

interface AnchorTag extends HtmlTag {
    download: string;
    hreflang: string;
    ping: string;
    referrerPolicy: string;
    rel: string;
    target: string;
    text: string;
    type: string;
}

interface AreaTag extends HtmlTag {
    alt: string;
    coords: string;
    download: string;
    ping: string;
    referrerPolicy: string;
    rel: string;
    shape: string;
    target: string;
}

interface MediaTag extends HtmlTag {
    autoplay?: boolean;
    controls?: boolean;
    crossOrigin?: string | null;
    currentTime?: number;
    defaultMuted?: boolean;
    defaultPlaybackRate?: number;
    disableRemotePlayback?: boolean;
    loop?: boolean;
    muted?: boolean;
    onencrypted?: ((this: HTMLMediaElement, ev: MediaEncryptedEvent) => any) | null;
    onwaitingforkey?: ((this: HTMLMediaElement, ev: Event) => any) | null;
    playbackRate?: number;
    preload?: "none" | "metadata" | "auto" | "";
    src?: string;
    srcObject?: MediaProvider | null;
    volume?: number;
}

interface BaseTag extends HtmlTag {
    href: string;
    target: string;
}

interface QuoteTag extends HtmlTag {
    cite: string;
}

interface ButtonTag extends HtmlTag {
    disabled: boolean;
    formAction: string;
    formEnctype: string;
    formMethod: string;
    formNoValidate: boolean;
    formTarget: string;
    name: string;
    type: string;
    value: string;
}

interface CanvasTag extends HtmlTag {
    height: number;
    width: number;
}

interface TableColTag extends HtmlTag {
    span: number;
}

interface DataTag extends HtmlTag {
    value: string;
}

interface ModTag extends HtmlTag {
    cite: string;
    dateTime: string;
}

interface DetailsTag extends HtmlTag {
    open: boolean;
}

interface EmbedTag extends HtmlTag {
    height: string;
    src: string;
    type: string;
    width: string;
}

interface FieldSetTag extends HtmlTag {
    disabled: boolean;
    name: string;
}

interface FormTag extends HtmlTag {
    acceptCharset: string;
    action: string;
    autocomplete: string;
    encoding: string;
    enctype: string;
    method: string;
    name: string;
    noValidate: boolean;
    target: string;
}

interface IFrameTag extends HtmlTag {
    allow: string;
    allowFullscreen: boolean;
    height: string;
    name: string;
    referrerPolicy: ReferrerPolicy;
    src: string;
    srcdoc: string;
    width: string;
}

interface ImageTag extends HtmlTag {
    alt: string;
    crossOrigin: string | null;
    decoding: "async" | "sync" | "auto";
    height: number;
    isMap: boolean;
    loading: string;
    referrerPolicy: string;
    sizes: string;
    src: string;
    srcset: string;
    useMap: string;
    width: number;
}

interface InputTag extends HtmlTag {
    accept: string;
    alt: string;
    autocomplete: string;
    capture: string;
    checked: boolean;
    defaultChecked: boolean;
    defaultValue: string;
    dirName: string;
    disabled: boolean;
    files: FileList | null;
    formAction: string;
    formEnctype: string;
    formMethod: string;
    formNoValidate: boolean;
    formTarget: string;
    height: number;
    indeterminate: boolean;
    max: string;
    maxLength: number;
    min: string;
    minLength: number;
    multiple: boolean;
    name: string;
    pattern: string;
    placeholder: string;
    readOnly: boolean;
    required: boolean;
    selectionDirection: "forward" | "backward" | "none" | null;
    selectionEnd: number | null;
    selectionStart: number | null;
    size: number;
    src: string;
    step: string;
    type: string;
    value: string;
    valueAsDate: Date | null;
    valueAsNumber: number;
    webkitdirectory: boolean;
    width: number;
}

interface LabelTag extends HtmlTag {
    htmlFor: string;
}

interface LITag extends HtmlTag {
    value: number;
}

interface LinkTag extends HtmlTag {
    as: string;
    crossOrigin: string | null;
    disabled: boolean;
    href: string;
    hreflang: string;
    imageSizes: string;
    imageSrcset: string;
    integrity: string;
    media: string;
    referrerPolicy: string;
    rel: string;
    type: string;
}

interface MapTag extends HtmlTag {
    name: string;
}

interface MeterTag extends HtmlTag {
    high: number;
    low: number;
    max: number;
    min: number;
    optimum: number;
    value: number;
}

interface ObjectTag extends HtmlTag {
    data: string;
    height: string;
    name: string;
    type: string;
    useMap: string;
    width: string;
}

interface OListTag extends HtmlTag {
    reversed: boolean;
    start: number;
    type: string;
}

interface OptGroupTag extends HtmlTag {
    disabled: boolean;
    label: string;
}

interface OptionTag extends HtmlTag {
    defaultSelected: boolean;
    disabled: boolean;
    label: string;
    selected: boolean;
    text: string;
    value: string;
}

interface OutputTag extends HtmlTag {
    defaultValue: string;
    name: string;
    value: string;
}

interface ParamTag extends HtmlTag {
    name: string;
    value: string;
}

interface ProgressTag extends HtmlTag {
    max: number;
    value: number;
}

interface ScriptTag extends HtmlTag {
    async: boolean;
    crossOrigin: string | null;
    defer: boolean;
    integrity: string;
    noModule: boolean;
    referrerPolicy: string;
    src: string;
    text: string;
    type: string;
}

interface SelectTag extends HtmlTag {
    autocomplete: string;
    disabled: boolean;
    length: number;
    multiple: boolean;
    name: string;
    required: boolean;
    selectedIndex: number;
    size: number;
    value: string;
}

interface SlotTag extends HtmlTag {
    name: string;
}

interface SourceTag extends HtmlTag {
    media: string;
    sizes: string;
    src: string;
    srcset: string;
    type: string;
}

interface StyleTag extends HtmlTag {
    media: string;
}

interface TableTag extends HtmlTag {
    caption: HTMLTableCaptionElement | null;
    tFoot: HTMLTableSectionElement | null;
    tHead: HTMLTableSectionElement | null;
}

interface TableCellTag extends HtmlTag {
    abbr: string;
    colSpan: number;
    headers: string;
    rowSpan: number;
    scope: string;
}

interface TextAreaTag extends HtmlTag {
    autocomplete: string;
    cols: number;
    defaultValue: string;
    dirName: string;
    disabled: boolean;
    maxLength: number;
    minLength: number;
    name: string;
    placeholder: string;
    readOnly: boolean;
    required: boolean;
    rows: number;
    selectionDirection: "forward" | "backward" | "none";
    selectionEnd: number;
    selectionStart: number;
    value: string;
    wrap: string;
}

interface TimeTag extends HtmlTag {
    dateTime: string;
}

interface TitleTag extends HtmlTag {
    text: string;
}

interface TrackTag extends HtmlTag {
    default: boolean;
    kind: string;
    label: string;
    src: string;
    srclang: string;
}

interface VideoTag extends MediaTag {
    disablePictureInPicture?: boolean;
    height?: number;
    onenterpictureinpicture?: ((this: HTMLVideoElement, ev: Event) => any) | null;
    onleavepictureinpicture?: ((this: HTMLVideoElement, ev: Event) => any) | null;
    playsInline?: boolean;
    poster?: string;
    width?: number;
}

export interface TagNameMap {
    a: AnchorTag;
    abbr: HtmlTag;
    address: HtmlTag;
    area: AreaTag;
    article: HtmlTag;
    aside: HtmlTag;
    audio: MediaTag;
    b: HtmlTag;
    base: BaseTag;
    bdi: HtmlTag;
    bdo: HtmlTag;
    blockquote: QuoteTag;
    body: HtmlTag;
    br: HtmlTag;
    button: ButtonTag;
    canvas: CanvasTag;
    caption: HtmlTag;
    cite: HtmlTag;
    code: HtmlTag;
    col: TableColTag;
    colgroup: TableColTag;
    data: DataTag;
    datalist: HtmlTag;
    dd: HtmlTag;
    del: ModTag;
    details: DetailsTag;
    dfn: HtmlTag;
    dialog: HtmlTag;
    div: HtmlTag;
    dl: HtmlTag;
    dt: HtmlTag;
    em: HtmlTag;
    embed: EmbedTag;
    fieldset: FieldSetTag;
    figcaption: HtmlTag;
    figure: HtmlTag;
    footer: HtmlTag;
    form: FormTag;
    h1: HtmlTag;
    h2: HtmlTag;
    h3: HtmlTag;
    h4: HtmlTag;
    h5: HtmlTag;
    h6: HtmlTag;
    head: HtmlTag;
    header: HtmlTag;
    hgroup: HtmlTag;
    hr: HtmlTag;
    html: HtmlTag;
    i: HtmlTag;
    iframe: IFrameTag;
    img: ImageTag;
    input: InputTag;
    ins: ModTag;
    kbd: HtmlTag;
    label: LabelTag;
    legend: HtmlTag;
    li: LITag;
    link: LinkTag;
    main: HtmlTag;
    map: MapTag;
    mark: HtmlTag;
    menu: HtmlTag;
    meta: HtmlTag;
    meter: MeterTag;
    nav: HtmlTag;
    noscript: HtmlTag;
    object: ObjectTag;
    ol: OListTag;
    optgroup: OptGroupTag;
    option: OptionTag;
    output: OutputTag;
    p: HtmlTag;
    param: ParamTag;
    picture: HtmlTag;
    pre: HtmlTag;
    progress: ProgressTag;
    q: QuoteTag;
    rp: HtmlTag;
    rt: HtmlTag;
    ruby: HtmlTag;
    s: HtmlTag;
    samp: HtmlTag;
    script: ScriptTag;
    section: HtmlTag;
    select: SelectTag;
    slot: SlotTag;
    small: HtmlTag;
    source: SourceTag;
    span: HtmlTag;
    strong: HtmlTag;
    style: StyleTag;
    sub: HtmlTag;
    summary: HtmlTag;
    sup: HtmlTag;
    table: TableTag;
    tbody: HtmlTag;
    td: TableCellTag;
    template: HtmlTag;
    textarea: TextAreaTag;
    tfoot: HtmlTag;
    th: TableCellTag;
    thead: HtmlTag;
    time: TimeTag;
    title: TitleTag;
    tr: HtmlTag;
    track: TrackTag;
    u: HtmlTag;
    ul: HtmlTag;
    var: HtmlTag;
    video: VideoTag;
    wbr: HtmlTag;
}
