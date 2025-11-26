import { compose, ref } from "steel-frame";

export default class MyClass {
  $reactive = ref(0);
  nonReactive = 0;

  render() {
    return compose(() => {});
  }
}
