import {IValue, AcceptedTagsMap, AcceptedTagsSpec} from "vasille";

export interface FragmentOptions {
    return ?: {[key: string]: any};
    slot ?: (...args: any[]) => void;
}


export type AttrType<T> = IValue<T | string | null> | T | string | null | undefined;

export interface TagOptions<T extends keyof AcceptedTagsMap> extends FragmentOptions {
    "v:attr" ?: { [K in keyof AcceptedTagsSpec[T]['attrs']]?: AttrType<AcceptedTagsSpec[T]['attrs'][K]> } &
        Record<string, AttrType<number | boolean>>;
    class ?: (string | IValue<string> | Record<string, boolean | IValue<boolean>>)[] |
        ({ $: IValue<string>[] } & Record<string, boolean | IValue<boolean>>);
    style ?: Record<string, string | IValue<string> | [number | string | IValue<number | string>, string]>;

    "v:events" ?: Partial<AcceptedTagsSpec[T]['events']>

    "v:set" ?: Partial<AcceptedTagsMap[T]> & Record<string, any>
    "v:bind" ?: { [K in keyof AcceptedTagsMap[T]] ?: IValue<AcceptedTagsMap[T][K]> } & Record<string, IValue<any>>
}

export interface AppOptions<K extends keyof AcceptedTagsMap> extends TagOptions<K> {
    debugUi ?: boolean
}

export interface PortalOptions extends AppOptions<'div'> {
    node : Element
    slot ?: () => void
}
