import { Fragment } from "vasille";

export type NoParams = NonNullable<unknown>;

export type RemoveTail<S extends string, Tail extends string> = S extends `${infer P}${Tail}` ? P : S;

// Remove all after '/', remove all after '-', for `123-rev-v3` use `:id-:name` => {id: "123", name: "rev-v3"}
export type GetRouteParameter<S extends string> = RemoveTail<RemoveTail<S, `/${string}`>, `-${string}`>;

export type RouteParameters<Route extends string> = string extends Route
    ? NoParams
    : Route extends `${string}:${infer Rest}`
      ? (GetRouteParameter<Rest> extends never
            ? NoParams
            : GetRouteParameter<Rest> extends `${infer ParamName}?`
              ? { [P in ParamName]?: string }
              : { [P in GetRouteParameter<Rest>]: string }) &
            (Rest extends `${GetRouteParameter<Rest>}${infer Next}` ? RouteParameters<Next> : unknown)
      : NoParams;

export type QueryParams = { [k: string]: string | string[] };

export type ScreenProps<Route extends string> = {
    path: string;
    params: RouteParameters<Route>;
    query: QueryParams;
    hash: string;
    canNavigate?: boolean
};

export type Response<Node, Element, TagOptions extends object, Route extends string> = (
    ctx: Fragment<Node, Element, TagOptions>,
    props: ScreenProps<Route>,
) => void | Promise<void>;

export type Screen<Node, Element, TagOptions extends object, Route extends string, Extras extends object> = {
    answer200?: Response<Node, Element, TagOptions, Route>;
    answer301?: Response<Node, Element, TagOptions, Route>;
    answer404?: Response<Node, Element, TagOptions, Route>;
    minAccessLevel?: number;
} & Extras;

export type Routing<Node, Element, TagOptions extends object, RoutePath extends string, Extras extends object> = {
    self?: Screen<Node, Element, TagOptions, RoutePath, Extras>;
    static: { [k: string]: Routing<Node, Element, TagOptions, RoutePath, Extras> };
    dynamic: { [k: string]: Routing<Node, Element, TagOptions, RoutePath, Extras> };
};
