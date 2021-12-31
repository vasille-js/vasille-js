// @flow

/**
 * Mark an object which can be destroyed
 * @class
 */
declare export class Destroyable {
    $seal () : void;
    $destroy () : void;
}
