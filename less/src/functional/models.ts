import {ArrayModel, MapModel, ObjectModel, SetModel, current, userError} from "vasille";


export function arrayModel<T>(arr : T[] = []) : ArrayModel<T> {
    if (!current) throw userError('missing parent node', 'out-of-context');
    return current.register(new ArrayModel(arr));
}

export function mapModel<K, T>(map : [K, T][] = []) : MapModel<K, T> {
    if (!current) throw userError('missing parent node', 'out-of-context');
    return current.register(new MapModel(map));
}

export function setModel<T>(arr : T[] = []) : SetModel<T> {
    if (!current) throw userError('missing parent node', 'out-of-context');
    return current.register(new SetModel(arr));
}

export function objectModel<T>(obj : { [p : string] : T } = {}) : ObjectModel<T> {
    if (!current) throw userError('missing parent node', 'out-of-context');
    return current.register(new ObjectModel(obj));
}
