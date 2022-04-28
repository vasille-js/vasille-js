import {ArrayModel} from "../models/array-model";
import {MapModel} from "../models/map-model";
import {SetModel} from "../models/set-model";
import {ObjectModel} from "../models/object-model";
import {current} from "../core/core";
import {userError} from "../core/errors";

export function arrayModel<T>(arr : T[] = []) : ArrayModel<T> {
    if (!current) throw userError('missing parent node', 'out-of-context');
    return current.register(new ArrayModel(arr)).proxy();
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
