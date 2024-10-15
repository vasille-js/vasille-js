export let reportError = (e: unknown) => {
    console.error(e);
    console.log("Docs Link /");
};

export function setErrorHandler(handler: (e: unknown) => void) {
    reportError = handler;
}
