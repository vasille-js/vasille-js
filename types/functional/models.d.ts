import { ArrayModel } from "../models/array-model";
import { MapModel } from "../models/map-model";
import { SetModel } from "../models/set-model";
import { ObjectModel } from "../models/object-model";
export declare function arrayModel<T>(arr?: T[]): ArrayModel<T>;
export declare function mapModel<K, T>(map?: [K, T][]): MapModel<K, T>;
export declare function setModel<T>(arr?: T[]): SetModel<T>;
export declare function objectModel<T>(obj?: {
    [p: string]: T;
}): ObjectModel<T>;
