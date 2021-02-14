// @flow
const reportIt = "Report it here: https://gitlab.com/vasille-js/vasille-js/-/issues";

/**
 * @return {string}
 */
export function notOverwritten () : string {
    console.error("Vasille.js: Internal error", "Must be overwritten", reportIt);
    return "not-overwritten";
}

/**
 * @return {string}
 */
export function internalError (msg : string) : string {
    console.error("Vasille.js: Internal error", msg, reportIt);
    return "internal-error";
}

/**
 * @return {string}
 */
export function userError (msg : string, err : string) : string {
    console.error("Vasille.js: User error", msg);
    return err;
}

/**
 * @return {string}
 */
export function typeError (msg : string) : string {
    return userError(msg, "type-error");
}

/**
 * @return {string}
 */
export function notFound (msg : string) : string {
    return userError(msg, "not-found");
}

/**
 * @return {string}
 */
export function wrongBinding (msg : string) : string {
    return userError(msg, "wrong-binding");
}
