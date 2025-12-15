export interface AppSide {
    highlight(ids: number[]): void;
    setLookup(active: boolean): void;
}

export interface IdeSide {
    clear(): void;
    listDebugItems(ids: number[]): void;
    callInspector(method: string, arg: object): void;
}
