export let reportError = (e: unknown): void => {
    console.error(e);
    console.log("Docs Link https://github.com/vasille-js/vasille-js/blob/v4/doc/V3-API.md");
};

export function setErrorHandler(handler: (e: unknown) => void) {
    reportError = handler;
}
