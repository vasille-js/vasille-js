// @ts-expect-error
import { webStyleSheet } from "vasille-web";

export const styleSheet = webStyleSheet({
  a: {
    margin: [1, 2],
  },
});
