import { screen, view } from "vasille-web";

export const IndexScreen = screen<"/index">(async () => {
  <div>index</div>;
});

export const UserScreen = screen<"/user/:id">(async ({ params }) => {
  <div>user:{params.id}</div>;
});

export const FailScreen = screen<"/fail">(async () => {
  throw new Error("Fail");
});

export const FallbackView = view(() => {
  <div>fallback</div>;
});

export const ErrorView = view((props: { error: unknown }) => {
  <div class="error">{props.error}</div>;
});

export let rvComponent1: ((v: unknown) => void) | null = null;
export let rvComponent2: ((v: unknown) => void) | null = null;
export let rvComponent3: ((v: unknown) => void) | null = null;

export const Component1 = screen<"/">(async () => {
  await new Promise(resolve => {
    rvComponent1 = resolve;
  });
  <div>component 1</div>;
})

export const Component2 = screen<"/page2">(async () => {
  await new Promise(resolve => {
    rvComponent2 = resolve;
  });
  <div>component 2</div>;
})

export const Component3 = screen<"/page3">(async () => {
  await new Promise(resolve => {
    rvComponent3 = resolve;
  });
  <div>component 3</div>;
})

export const LoadingScreen = view(() => {
  <div>loading</div>;
})

export const LoadingOverlay = view(() => {
  <div>loading overlay</div>;
})
