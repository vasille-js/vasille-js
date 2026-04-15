import { compose, Iterate } from "steel-frame";

const C = compose(() => {
  <Iterate value={[1]} slot={() => 0} />;
});
