import {ArrayModel} from "../models/array-model";
import {MapModel} from "../models/map-model";
import {SetModel} from "../models/set-model";
import {ObjectModel} from "../models/object-model";
import {current} from "../core/core";

export function arrayModel<T>(arr : T[] = []) {
    const model = new ArrayModel(arr);

    current.register(model);
    return model;
}

export function mapModel<K, T>(map : [K, T][] = []) {
    const model = new MapModel(map);

    current.register(model);
    return model;
}

export function setModel<T>(arr : T[] = []) {
    const model = new SetModel(arr);

    current.register(model);
    return model;
}

export function objectModel<T>(obj : { [p : string] : T } = {}) {
    const model = new ObjectModel(obj).proxy();

    current.register(model);
    return model;
}
