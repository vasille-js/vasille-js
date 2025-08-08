export type EventHandler<T> = (ev: T) => any;

export interface Tag<Attrs, Events, Props> {
    attrs: Attrs;
    events: Events;
    props: Props;
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
    value: string;
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
    a: Tag<AAttrs, TagEvents, AnchorProps>;
    abbr: Tag<TagAttrs, TagEvents, TagProps<HTMLElement>>;
    address: Tag<TagAttrs, TagEvents, TagProps<HTMLElement>>;
    area: Tag<AreaAttrs, TagEvents, AreaProps>;
    article: Tag<TagAttrs, TagEvents, TagProps<HTMLElement>>;
    aside: Tag<TagAttrs, TagEvents, TagProps<HTMLElement>>;
    audio: Tag<MediaTagAttrs, MediaEvents, MediaProps<HTMLAudioElement>>;
    b: Tag<TagAttrs, TagEvents, TagProps<HTMLElement>>;
    base: Tag<BaseAttrs, TagEvents, BaseProps>;
    bdi: Tag<TagAttrs, TagEvents, TagProps<HTMLElement>>;
    bdo: Tag<BdoAttrs, TagEvents, TagProps<HTMLElement>>;
    blockquote: Tag<BlockQuoteAttrs, TagEvents, QuoteProps>;
    body: Tag<TagAttrs, BodyEvents, TagProps<HTMLBodyElement>>;
    br: Tag<TagAttrs, TagEvents, TagProps<HTMLBRElement>>;
    button: Tag<ButtonAttrs, TagEvents, ButtonProps>;
    canvas: Tag<TagAttrs, TagEvents, CanvasProps>;
    caption: Tag<TagAttrs, TagEvents, TagProps<HTMLElement>>;
    cite: Tag<TagAttrs, TagEvents, TagProps<HTMLElement>>;
    code: Tag<TagAttrs, TagEvents, TagProps<HTMLElement>>;
    col: Tag<ColAttrs, TagEvents, TableColProps>;
    colgroup: Tag<ColAttrs, TagEvents, TableColProps>;
    data: Tag<DataAttr, TagEvents, DataProps>;
    datalist: Tag<TagAttrs, TagEvents, TagProps<HTMLDataListElement>>;
    dd: Tag<TagAttrs, TagEvents, TagProps<HTMLElement>>;
    del: Tag<TagAttrs, TagEvents, ModProps<HTMLModElement>>;
    details: Tag<DetailsAttrs, TagEvents, DetailsProps>;
    dfn: Tag<TagAttrs, TagEvents, TagProps<HTMLElement>>;
    dialog: Tag<TagAttrs, TagEvents, TagProps<HTMLDialogElement>>;
    dir: Tag<TagAttrs, TagEvents, TagProps<HTMLElement>>;
    div: Tag<TagAttrs, TagEvents, TagProps<HTMLDivElement>>;
    dl: Tag<TagAttrs, TagEvents, TagProps<HTMLDListElement>>;
    dt: Tag<TagAttrs, TagEvents, TagProps<HTMLElement>>;
    em: Tag<TagAttrs, TagEvents, TagProps<HTMLElement>>;
    embed: Tag<EmbedAttrs, TagEvents, EmbedProps>;
    fieldset: Tag<FieldsetAttrs, TagEvents, FieldSetProps>;
    figcaption: Tag<TagAttrs, TagEvents, TagProps<HTMLElement>>;
    figure: Tag<TagAttrs, TagEvents, TagProps<HTMLElement>>;
    font: Tag<TagAttrs, TagEvents, TagProps<HTMLElement>>;
    footer: Tag<TagAttrs, TagEvents, TagProps<HTMLElement>>;
    form: Tag<FormAttrs, TagEvents, FormProps>;
    frame: Tag<TagAttrs, TagEvents, TagProps<HTMLFrameElement>>;
    frameset: Tag<TagAttrs, TagEvents, TagProps<HTMLFrameSetElement>>;
    h1: Tag<TagAttrs, TagEvents, TagProps<HTMLHeadingElement>>;
    h2: Tag<TagAttrs, TagEvents, TagProps<HTMLHeadingElement>>;
    h3: Tag<TagAttrs, TagEvents, TagProps<HTMLHeadingElement>>;
    h4: Tag<TagAttrs, TagEvents, TagProps<HTMLHeadingElement>>;
    h5: Tag<TagAttrs, TagEvents, TagProps<HTMLHeadingElement>>;
    h6: Tag<TagAttrs, TagEvents, TagProps<HTMLHeadingElement>>;
    head: Tag<TagAttrs, TagEvents, TagProps<HTMLHeadElement>>;
    header: Tag<TagAttrs, TagEvents, TagProps<HTMLElement>>;
    hgroup: Tag<TagAttrs, TagEvents, TagProps<HTMLElement>>;
    hr: Tag<TagAttrs, TagEvents, TagProps<HTMLHRElement>>;
    i: Tag<TagAttrs, TagEvents, TagProps<HTMLElement>>;
    iframe: Tag<IframeAttrs, TagEvents, IFrameProps>;
    img: Tag<ImgAttrs, TagEvents, ImageProps>;
    input: Tag<InputAttrs, TagEvents, InputProps>;
    ins: Tag<TagAttrs, TagEvents, ModProps<HTMLModElement>>;
    kbd: Tag<TagAttrs, TagEvents, TagProps<HTMLElement>>;
    label: Tag<LabelAttrs, TagEvents, LabelProps>;
    legend: Tag<TagAttrs, TagEvents, TagProps<HTMLLegendElement>>;
    li: Tag<TagAttrs, TagEvents, LiProps>;
    link: Tag<LinkAttrs, TagEvents, LinkProps>;
    main: Tag<TagAttrs, TagEvents, TagProps<HTMLElement>>;
    map: Tag<MapAttrs, TagEvents, MapProps>;
    mark: Tag<TagAttrs, TagEvents, TagProps<HTMLElement>>;
    marquee: Tag<TagAttrs, TagEvents, TagProps<HTMLMarqueeElement>>;
    menu: Tag<TagAttrs, TagEvents, TagProps<HTMLMenuElement>>;
    meta: Tag<MetaAttrs, TagEvents, TagProps<HTMLMetaElement>>;
    meter: Tag<MeterAttrs, TagEvents, MeterProps>;
    nav: Tag<TagAttrs, TagEvents, TagProps<HTMLElement>>;
    noscript: Tag<TagAttrs, TagEvents, TagProps<HTMLElement>>;
    object: Tag<ObjectAttrs, TagEvents, ObjectProps>;
    ol: Tag<OlAttrs, TagEvents, OListProps>;
    optgroup: Tag<OptgroupAttrs, TagEvents, OptGroupProps>;
    option: Tag<OptionAttrs, TagEvents, OptionProps>;
    output: Tag<OutputAttrs, TagEvents, OutputProps>;
    p: Tag<TagAttrs, TagEvents, TagProps<HTMLParagraphElement>>;
    param: Tag<ParamAttrs, TagEvents, ParamProps>;
    picture: Tag<TagAttrs, TagEvents, TagProps<HTMLPictureElement>>;
    pre: Tag<TagAttrs, TagEvents, TagProps<HTMLPreElement>>;
    progress: Tag<ProgressAttrs, TagEvents, ProgressProps>;
    q: Tag<QAttrs, TagEvents, QuoteProps>;
    rp: Tag<TagAttrs, TagEvents, TagProps<HTMLElement>>;
    rt: Tag<TagAttrs, TagEvents, TagProps<HTMLElement>>;
    ruby: Tag<TagAttrs, TagEvents, TagProps<HTMLElement>>;
    s: Tag<TagAttrs, TagEvents, TagProps<HTMLElement>>;
    samp: Tag<TagAttrs, TagEvents, TagProps<HTMLElement>>;
    script: Tag<TagAttrs, TagEvents, ScriptProps>;
    section: Tag<TagAttrs, TagEvents, TagProps<HTMLElement>>;
    select: Tag<SelectAttrs, TagEvents, SelectProps>;
    slot: Tag<TagAttrs, TagEvents, SlotProps>;
    small: Tag<TagAttrs, TagEvents, TagProps<HTMLElement>>;
    source: Tag<SourceAttrs, TagEvents, SourceProps>;
    span: Tag<TagAttrs, TagEvents, TagProps<HTMLSpanElement>>;
    strong: Tag<TagAttrs, TagEvents, TagProps<HTMLElement>>;
    style: Tag<StyleAttrs, TagEvents, StyleProps>;
    sub: Tag<TagAttrs, TagEvents, TagProps<HTMLElement>>;
    summary: Tag<TagAttrs, TagEvents, TagProps<HTMLElement>>;
    sup: Tag<TagAttrs, TagEvents, TagProps<HTMLElement>>;
    table: Tag<TagAttrs, TagEvents, TableProps>;
    tbody: Tag<TagAttrs, TagEvents, TagProps<HTMLElement>>;
    td: Tag<TdAttrs, TagEvents, TableCellProps<HTMLTableDataCellElement>>;
    template: Tag<TagAttrs, TagEvents, TagProps<HTMLTemplateElement>>;
    textarea: Tag<TextareaAttrs, TagEvents, TextAreaProps>;
    tfoot: Tag<TagAttrs, TagEvents, TagProps<HTMLElement>>;
    th: Tag<ThAttrs, TagEvents, TableCellProps<HTMLTableHeaderCellElement>>;
    thead: Tag<TagAttrs, TagEvents, TagProps<HTMLElement>>;
    time: Tag<TagAttrs, TagEvents, TimeProps>;
    title: Tag<TagAttrs, TagEvents, TitleProps>;
    tr: Tag<TagAttrs, TagEvents, TagProps<HTMLElement>>;
    track: Tag<TrackAttrs, TagEvents, TrackProps>;
    u: Tag<TagAttrs, TagEvents, TagProps<HTMLElement>>;
    ul: Tag<TagAttrs, TagEvents, TagProps<HTMLUListElement>>;
    var: Tag<TagAttrs, TagEvents, TagProps<HTMLElement>>;
    video: Tag<VideoAttrs, VideoEvents, VideoProps>;
    wbr: Tag<TagAttrs, TagEvents, TagProps<HTMLElement>>;
}

export interface TagEventsProps<T extends Element> {
    onabort?: ((this: T, ev: UIEvent) => any) | null;
    onanimationcancel?: ((this: T, ev: AnimationEvent) => any) | null;
    onanimationend?: ((this: T, ev: AnimationEvent) => any) | null;
    onanimationiteration?: ((this: T, ev: AnimationEvent) => any) | null;
    onanimationstart?: ((this: T, ev: AnimationEvent) => any) | null;
    onauxclick?: ((this: T, ev: MouseEvent) => any) | null;
    onblur?: ((this: T, ev: FocusEvent) => any) | null;
    oncanplay?: ((this: T, ev: Event) => any) | null;
    oncanplaythrough?: ((this: T, ev: Event) => any) | null;
    onchange?: ((this: T, ev: Event) => any) | null;
    onclick?: ((this: T, ev: MouseEvent) => any) | null;
    onclose?: ((this: T, ev: Event) => any) | null;
    oncontextmenu?: ((this: T, ev: MouseEvent) => any) | null;
    oncopy?: ((this: T, ev: ClipboardEvent) => any) | null;
    oncut?: ((this: T, ev: ClipboardEvent) => any) | null;
    oncuechange?: ((this: T, ev: Event) => any) | null;
    ondblclick?: ((this: T, ev: MouseEvent) => any) | null;
    ondrag?: ((this: T, ev: DragEvent) => any) | null;
    ondragend?: ((this: T, ev: DragEvent) => any) | null;
    ondragenter?: ((this: T, ev: DragEvent) => any) | null;
    ondragleave?: ((this: T, ev: DragEvent) => any) | null;
    ondragover?: ((this: T, ev: DragEvent) => any) | null;
    ondragstart?: ((this: T, ev: DragEvent) => any) | null;
    ondrop?: ((this: T, ev: DragEvent) => any) | null;
    ondurationchange?: ((this: T, ev: Event) => any) | null;
    onemptied?: ((this: T, ev: Event) => any) | null;
    onended?: ((this: T, ev: Event) => any) | null;
    onerror?: ((this: T, ev: Event | string, src?: string, line?: number, col?: number, err?: Error) => any) | null;
    onfocus?: ((this: T, ev: FocusEvent) => any) | null;
    onformdata?: ((this: T, ev: FormDataEvent) => any) | null;
    onfullscreenchange?: ((this: T, ev: Event) => any) | null;
    onfullscreenerror?: ((this: T, ev: Event) => any) | null;
    ongotpointercapture?: ((this: T, ev: PointerEvent) => any) | null;
    oninput?: ((this: T, ev: Event) => any) | null;
    oninvalid?: ((this: T, ev: Event) => any) | null;
    onkeydown?: ((this: T, ev: KeyboardEvent) => any) | null;
    onkeypress?: ((this: T, ev: KeyboardEvent) => any) | null;
    onkeyup?: ((this: T, ev: KeyboardEvent) => any) | null;
    onload?: ((this: T, ev: Event) => any) | null;
    onloadeddata?: ((this: T, ev: Event) => any) | null;
    onloadedmetadata?: ((this: T, ev: Event) => any) | null;
    onloadstart?: ((this: T, ev: Event) => any) | null;
    onlostpointercapture?: ((this: T, ev: PointerEvent) => any) | null;
    onmousedown?: ((this: T, ev: MouseEvent) => any) | null;
    onmouseenter?: ((this: T, ev: MouseEvent) => any) | null;
    onmouseleave?: ((this: T, ev: MouseEvent) => any) | null;
    onmousemove?: ((this: T, ev: MouseEvent) => any) | null;
    onmouseout?: ((this: T, ev: MouseEvent) => any) | null;
    onmouseover?: ((this: T, ev: MouseEvent) => any) | null;
    onmouseup?: ((this: T, ev: MouseEvent) => any) | null;
    onpaste?: ((this: T, ev: ClipboardEvent) => any) | null;
    onpause?: ((this: T, ev: Event) => any) | null;
    onplay?: ((this: T, ev: Event) => any) | null;
    onplaying?: ((this: T, ev: Event) => any) | null;
    onpointercancel?: ((this: T, ev: PointerEvent) => any) | null;
    onpointerdown?: ((this: T, ev: PointerEvent) => any) | null;
    onpointerenter?: ((this: T, ev: PointerEvent) => any) | null;
    onpointerleave?: ((this: T, ev: PointerEvent) => any) | null;
    onpointermove?: ((this: T, ev: PointerEvent) => any) | null;
    onpointerout?: ((this: T, ev: PointerEvent) => any) | null;
    onpointerover?: ((this: T, ev: PointerEvent) => any) | null;
    onpointerup?: ((this: T, ev: PointerEvent) => any) | null;
    onprogress?: ((this: T, ev: ProgressEvent) => any) | null;
    onratechange?: ((this: T, ev: Event) => any) | null;
    onreset?: ((this: T, ev: Event) => any) | null;
    onresize?: ((this: T, ev: UIEvent) => any) | null;
    onscroll?: ((this: T, ev: Event) => any) | null;
    onseeked?: ((this: T, ev: Event) => any) | null;
    onseeking?: ((this: T, ev: Event) => any) | null;
    onselect?: ((this: T, ev: Event) => any) | null;
    onselectionchange?: ((this: T, ev: Event) => any) | null;
    onselectstart?: ((this: T, ev: Event) => any) | null;
    onstalled?: ((this: T, ev: Event) => any) | null;
    onsubmit?: ((this: T, ev: SubmitEvent) => any) | null;
    onsuspend?: ((this: T, ev: Event) => any) | null;
    ontimeupdate?: ((this: T, ev: Event) => any) | null;
    ontoggle?: ((this: T, ev: Event) => any) | null;
    ontouchcancel?: ((this: T, ev: TouchEvent) => any) | null | undefined;
    ontouchend?: ((this: T, ev: TouchEvent) => any) | null | undefined;
    ontouchmove?: ((this: T, ev: TouchEvent) => any) | null | undefined;
    ontouchstart?: ((this: T, ev: TouchEvent) => any) | null | undefined;
    ontransitioncancel?: ((this: T, ev: TransitionEvent) => any) | null;
    ontransitionend?: ((this: T, ev: TransitionEvent) => any) | null;
    ontransitionrun?: ((this: T, ev: TransitionEvent) => any) | null;
    ontransitionstart?: ((this: T, ev: TransitionEvent) => any) | null;
    onvolumechange?: ((this: T, ev: Event) => any) | null;
    onwaiting?: ((this: T, ev: Event) => any) | null;
    onwheel?: ((this: T, ev: WheelEvent) => any) | null;
}

interface TagProps<T extends Element> extends TagEventsProps<T> {
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

interface AnchorProps extends TagProps<HTMLAnchorElement> {
    download: string;
    hreflang: string;
    ping: string;
    referrerPolicy: string;
    rel: string;
    target: string;
    text: string;
    type: string;
}

interface AreaProps extends TagProps<HTMLAreaElement> {
    alt: string;
    coords: string;
    download: string;
    ping: string;
    referrerPolicy: string;
    rel: string;
    shape: string;
    target: string;
}

interface MediaProps<T extends HTMLMediaElement> extends TagProps<T> {
    autoplay?: boolean;
    controls?: boolean;
    crossOrigin?: string | null;
    currentTime?: number;
    defaultMuted?: boolean;
    defaultPlaybackRate?: number;
    disableRemotePlayback?: boolean;
    loop?: boolean;
    muted?: boolean;
    onencrypted?: ((this: T, ev: MediaEncryptedEvent) => any) | null;
    onwaitingforkey?: ((this: T, ev: Event) => any) | null;
    playbackRate?: number;
    preload?: "none" | "metadata" | "auto" | "";
    src?: string;
    srcObject?: MediaProvider | null;
    volume?: number;
}

interface BaseProps extends TagProps<HTMLBaseElement> {
    href: string;
    target: string;
}

interface QuoteProps extends TagProps<HTMLQuoteElement> {
    cite: string;
}

interface ButtonProps extends TagProps<HTMLButtonElement> {
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

interface CanvasProps extends TagProps<HTMLCanvasElement> {
    height: number;
    width: number;
}

interface TableColProps extends TagProps<HTMLTableColElement> {
    span: number;
}

interface DataProps extends TagProps<HTMLDataElement> {
    value: string;
}

interface ModProps<T extends HTMLModElement> extends TagProps<T> {
    cite: string;
    dateTime: string;
}

interface DetailsProps extends TagProps<HTMLDetailsElement> {
    open: boolean;
}

interface EmbedProps extends TagProps<HTMLEmbedElement> {
    height: string;
    src: string;
    type: string;
    width: string;
}

interface FieldSetProps extends TagProps<HTMLFieldSetElement> {
    disabled: boolean;
    name: string;
}

interface FormProps extends TagProps<HTMLFormElement> {
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

interface IFrameProps extends TagProps<HTMLIFrameElement> {
    allow: string;
    allowFullscreen: boolean;
    height: string;
    name: string;
    referrerPolicy: ReferrerPolicy;
    src: string;
    srcdoc: string;
    width: string;
}

interface ImageProps extends TagProps<HTMLImageElement> {
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

interface InputProps extends TagProps<HTMLInputElement> {
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

interface LabelProps extends TagProps<HTMLLabelElement> {
    htmlFor: string;
}

interface LiProps extends TagProps<HTMLLIElement> {
    value: number;
}

interface LinkProps extends TagProps<HTMLLinkElement> {
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

interface MapProps extends TagProps<HTMLMapElement> {
    name: string;
}

interface MeterProps extends TagProps<HTMLMeterElement> {
    high: number;
    low: number;
    max: number;
    min: number;
    optimum: number;
    value: number;
}

interface ObjectProps extends TagProps<HTMLObjectElement> {
    data: string;
    height: string;
    name: string;
    type: string;
    useMap: string;
    width: string;
}

interface OListProps extends TagProps<HTMLOListElement> {
    reversed: boolean;
    start: number;
    type: string;
}

interface OptGroupProps extends TagProps<HTMLOptGroupElement> {
    disabled: boolean;
    label: string;
}

interface OptionProps extends TagProps<HTMLOptionElement> {
    defaultSelected: boolean;
    disabled: boolean;
    label: string;
    selected: boolean;
    text: string;
    value: string;
}

interface OutputProps extends TagProps<HTMLOutputElement> {
    defaultValue: string;
    name: string;
    value: string;
}

interface ParamProps extends TagProps<HTMLParamElement> {
    name: string;
    value: string;
}

interface ProgressProps extends TagProps<HTMLProgressElement> {
    max: number;
    value: number;
}

interface ScriptProps extends TagProps<HTMLScriptElement> {
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

interface SelectProps extends TagProps<HTMLSelectElement> {
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

interface SlotProps extends TagProps<HTMLSlotElement> {
    name: string;
}

interface SourceProps extends TagProps<HTMLSourceElement> {
    media: string;
    sizes: string;
    src: string;
    srcset: string;
    type: string;
}

interface StyleProps extends TagProps<HTMLStyleElement> {
    media: string;
}

interface TableProps extends TagProps<HTMLTableElement> {
    caption: HTMLTableCaptionElement | null;
    tFoot: HTMLTableSectionElement | null;
    tHead: HTMLTableSectionElement | null;
}

interface TableCellProps<T extends HTMLTableCellElement> extends TagProps<T> {
    abbr: string;
    colSpan: number;
    headers: string;
    rowSpan: number;
    scope: string;
}

interface TextAreaProps extends TagProps<HTMLTextAreaElement> {
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

interface TimeProps extends TagProps<HTMLTimeElement> {
    dateTime: string;
}

interface TitleProps extends TagProps<HTMLTitleElement> {
    text: string;
}

interface TrackProps extends TagProps<HTMLTrackElement> {
    default: boolean;
    kind: string;
    label: string;
    src: string;
    srclang: string;
}

interface VideoProps extends MediaProps<HTMLVideoElement> {
    disablePictureInPicture?: boolean;
    height?: number;
    onenterpictureinpicture?: ((this: HTMLVideoElement, ev: Event) => any) | null;
    onleavepictureinpicture?: ((this: HTMLVideoElement, ev: Event) => any) | null;
    playsInline?: boolean;
    poster?: string;
    width?: number;
}
