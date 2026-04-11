import { compose, context, receive, share } from "steel-frame";

const Context = context(() => {
  return {
    a: 1,
  };
});

const C = compose(() => {
  const { a } = share(Context);
  const { a: b } = receive(Context);
  const c = share(Context);
  const d = receive(Context);
});
