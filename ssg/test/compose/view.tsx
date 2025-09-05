import {beforeMount, page, prompt, Slot, view} from "vasille-web";

interface Props {
  slot(): void;
}

const promptError = prompt(() => {});

export let controller: {promptError(): void}|null = null;

const DivView = view(({slot}: Props) => {
  <div class="view">
    <Slot slot={slot} />
  </div>
})

export default page(async () => {
  beforeMount(() => {
    controller = {
      promptError() {
        promptError({});
      }
    }
  });

  <DivView/>;
  <DivView>
    <span>Hello</span>
  </DivView>;
})

export function runViewDirectly() {
  DivView({});
}
