import {compose} from "vasille-web"

const Embed = compose(() => {
  <div>Embed</div>
})

export const Component = compose(() => {
  <div>
    Hello world!
  </div>;
  <Embed />;
});
