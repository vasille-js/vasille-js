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
