import { compose, ref } from "vasille-web";

export default class MyClass {
  $reactive = ref(0);
  nonReactive = 0;

  render() {
    return compose(() => {});
  }
}
