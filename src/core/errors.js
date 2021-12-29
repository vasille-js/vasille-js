// @flow
const reportIt = "Report it here: https://gitlab.com/vasille-js/vasille-js/-/issues";

export function notOverwritten () : string {
    console.error("Vasille.js: Internal error", "Must be overwritten", reportIt);
    return "not-overwritten";
}

export function internalError (msg : string) : string {
    console.error("Vasille.js: Internal error", msg, reportIt);
    return "internal-error";
}

export function userError (msg : string, err : string) : string {
    console.error("Vasille.js: User error", msg);
    return err;
}

export function mirrorError(msg : string) : string {
    return userError(msg, "mirror-error");
}

export function notFound (msg : string) : string {
    return userError(msg, "not-found");
}

export function wrongBinding (msg : string) : string {
    return userError(msg, "wrong-binding");
}
