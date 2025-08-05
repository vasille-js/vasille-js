import {compose, forward} from "vasille-web"

export const control: {
  setParentValue?(value: string): void;
  setChildValue?(value: string): void;
} = {};

const Embed = compose(({text}:{text: string}) => {
  control.setChildValue = value => {
    text = value
  }

  <div>Embed {text}</div>
})

export const Component = compose(() => {
  let text = "test";

  control.setParentValue = value => {
    text = value
  }

  <div>
    Hello {text}!
  </div>;
  <Embed text={forward(text)} />;
});
