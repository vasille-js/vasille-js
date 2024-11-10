import { Debug, compose } from "vasille-web";

export const App = compose(() => {
  <div class="example">
    Welcome to Vasille example
    <Debug model="Look to me from dev tools"/>
  </div>
});
