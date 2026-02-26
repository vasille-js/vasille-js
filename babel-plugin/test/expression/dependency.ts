import { component, impute, receive, share } from "steel-frame";

const C = component(() => {
  const shared = "X" + share("x", "y");
  const received = receive("x");
  const fallback = impute("y", "z");

  share("a", "b");
});
