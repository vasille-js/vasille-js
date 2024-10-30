import * as DX from "vasille-dx";

export const C = DX.compose(() => {
    const DX = {
        compose() {
            return 3;
        }
    };
    const sum = DX.compose() + 2;
});
