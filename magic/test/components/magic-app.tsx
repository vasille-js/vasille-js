import {TagOptions, VComponent} from "vasille-magic";

interface myOpts extends TagOptions<"video"> {
    "inp-ut" : string
    slot?: () => void
    slot2?: (opts : {x: number, y: number}) => void
    return : {
        y?: number
    }
}

export const MagicApp : VComponent<myOpts> = () => {
    return {
        y: 23
    }
}
