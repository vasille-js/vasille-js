export function destroyObject (obj) {
    for (let i in obj) {
        if (obj.hasOwnProperty(i)) {
            let prop = obj[i];
            if (prop.destroy instanceof Function) {
                prop.destroy();
            }
        }
    }
}
