import { compose, ForEach } from "steel-frame";

const C = compose(() => {
  // @ts-expect-error
  <ForEach value={[]} slot={0} />;
});
