import {view} from "vasille-web"

const Embed = view(() => {
  <div>Embed</div>
})

export const Component = view(() => {
  <div>
    Hello world!
  </div>;
  <Embed />;
});
