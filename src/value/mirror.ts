import { IValue } from "../core/ivalue";
import { Reference } from "./reference";



/**
 * Declares a notifiable bind to a value
 * @class Mirror
 * @extends IValue
 * @version 2
 */
export class Mirror<T> extends Reference<T> {
    /**
     * pointed value
     * @type IValue
     */
    protected pointedValue : IValue<T>;

    /**
     * Collection of handlers
     * @type Set
     */
    private readonly handler : (value : T) => void;

    /**
     * Ensure forward only synchronization
     */
    public forwardOnly : boolean;

    /**
     * Constructs a notifiable bind to a value
     * @param value {IValue} is initial value
     * @param forwardOnly {boolean} ensure forward only synchronization
     */
    public constructor (value : IValue<T>, forwardOnly = false) {
        super (value.$);
        this.handler = (v : T) => {
            this.$ = v;
        };
        this.pointedValue = value;
        this.forwardOnly = forwardOnly;

        value.on (this.handler);
        this.seal ();
    }

    public get $ () : T {
        // this is a ts bug
        // eslint-disable-next-line
        // @ts-ignore
        return super.$;
    }

    public set $ (v : T) {
        if (!this.forwardOnly) {
            this.pointedValue.$ = v;
        }
        // this is a ts bug
        // eslint-disable-next-line
        // @ts-ignore
        super.$ = v;
    }

    public enable () : void {
        if (!this.isEnabled) {
            this.isEnabled = true;
            this.pointedValue.on(this.handler);
            this.$ = this.pointedValue.$;
        }
    }

    public disable () : void {
        if (this.isEnabled) {
            this.pointedValue.off(this.handler);
            this.isEnabled = false;
        }
    }

    public destroy () {
        this.disable();
        super.destroy();
    }
}
