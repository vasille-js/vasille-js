import { beforeMount, component, screen, view } from "vasille-web";

const IndexScreen = screen<"/index">(async () => {
  <div>index</div>;
});

const UserScreen = screen<"/user/(id)">(async ({ params }) => {
  <div>user:{params.id}</div>;
});

function throwNow (): number {
  throw new Error("Fail")
}

const FailScreen = screen<"/fail">(async () => {
  // @ts-ignore
  const a = throwNow();
});

const FallbackView = view(() => {
  <div>fallback</div>;
});

const ErrorView = view((props: { error: unknown }) => {
  <div class="error">{props.error}</div>;
});

export let rvComponent1: ((v: unknown) => void) | null = null;
export let rvComponent2: ((v: unknown) => void) | null = null;
export let rvComponent3: ((v: unknown) => void) | null = null;

const C1Screen = screen<"/">(async () => {
  const r = await new Promise(resolve => {
    rvComponent1 = resolve;
  });
  <div>component 1</div>;
});

const C2Screen = screen<"/page2">(async () => {
  const r = await new Promise(resolve => {
    rvComponent2 = resolve;
  });
  <div>component 2</div>;
});

const C3Screen = screen<"/page3">(async () => {
  const r = await new Promise(resolve => {
    rvComponent3 = resolve;
  });
  <div>component 3</div>;
});

const LoadingScreen = component(() => {
  <div>loading</div>;
});

const LoadingOverlay = component(() => {
  <div>loading overlay</div>;
});

export const x = {
  IndexScreen,
  UserScreen,
  FailScreen,
  FallbackView,
  LoadingScreen,
  ErrorView,
  LoadingOverlay,
  C1Screen,
  C2Screen,
  C3Screen,
};
