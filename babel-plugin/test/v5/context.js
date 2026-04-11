import { compose, context, receive, share } from "vasille-web";
const Context = context(() => {
  return {
    a: 1
  };
});
const C = compose(Vasille => {
  const {
    a
  } = share(Vasille, Context);
  const {
    a: b
  } = receive(Vasille, Context);
  const c = share(Vasille, Context);
  const d = receive(Vasille, Context);
});