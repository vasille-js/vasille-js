// @flow

import {Listener} from "./listener";

export interface IModel<K, T> {
    enableReactivity () : void;
    disableReactivity () : void;
    
    listener: Listener<T,  K>;
}
