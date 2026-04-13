export let reportError = (e: unknown): void => {
    console.error(e);
};

export function setErrorHandler(handler: (e: unknown) => void) {
    reportError = handler;
}

export function safe<Args extends unknown[], Ret extends unknown>(
    fn: (...args: Args) => Ret,
): (...args: Args) => Ret extends Promise<unknown> ? void : Ret | undefined {
    return ((...args: Args) => {
        try {
            const result = fn(...args);

            if (result instanceof Promise) {
                result.catch(reportError);
            } else {
                return result;
            }
        } catch (e: unknown) {
            reportError(e);
        }
    }) as (...args: Args) => Ret extends Promise<unknown> ? void : Ret | undefined;
}
