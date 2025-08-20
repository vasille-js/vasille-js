import { compose } from "vasille-web";

const C = compose(() => {
  let $a = "text";

  <div>
    text1 Hello {"world"}
    {$a} is text
    <div />
  </div>;
});
