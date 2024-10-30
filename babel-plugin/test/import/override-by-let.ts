import { compose } from "vasille-dx";

export const C = compose(() => {
    const compose = () => 3;
    const sum = compose() + 2;
});
