import { Fragment } from "vasille";

export type NoParams = NonNullable<unknown>;

export type RemoveTail<S extends string, Tail extends string> = S extends `${infer P}${Tail}` ? P : S;
export type RemoveHead<S extends string, Head extends string> = S extends `${Head}${infer P}` ? P : S;

// Remove all after '/', for `/123/rev-v3` use `/(id)/(name)` => {id: "123", name: "rev-v3"}
export type GetRouteParameter<S extends string> = RemoveTail<S, `/${string}`>;

export type RouteParameters<Route extends string> = string extends Route
    ? NoParams
    : Route extends `${string}/*`
      ? RouteParameters<RemoveTail<Route, "/*">> & {
            "*": string;
        }
      : Route extends `${string}*${string}`
        ? NoParams
        : Route extends `(${infer Id})/${string}`
          ? RouteParameters<RemoveHead<Route, `(${Id})/`>> & { [k in Id]: string }
          : Route extends `${infer Head}/${string}`
            ? RouteParameters<RemoveHead<Route, `${Head}/`>>
            : Route extends `(${infer Id})`
              ? { [k in Id]: string }
              : Route extends `/${infer Path}`
                ? RouteParameters<Path>
                : NoParams;

export type QueryParams = { [k: string]: string[] };

export type ScreenProps<Route extends string> = {
    url: string;
    path: string;
    params: RouteParameters<Route>;
    query: QueryParams;
    hash: string;
};

export type Screen<Node, Element, TagOptions extends object, Route extends string> = (
    props: ScreenProps<Route>,
    ctx: Fragment<Node, Element, TagOptions>,
) => Promise<void>;

export type Answer<Node, Element, TagOptions extends object, Route extends string, Extras extends object> = {
    screen: Screen<Node, Element, TagOptions, Route>;
} & Extras;

export type Routing<Node, Element, TagOptions extends object, RoutePath extends string, Extras extends object> = {
    self?: Answer<Node, Element, TagOptions, RoutePath, Extras>;
    static: { [k: string]: Routing<Node, Element, TagOptions, RoutePath, Extras> };
    dynamic: { [k: string]: Routing<Node, Element, TagOptions, RoutePath, Extras> };
};
