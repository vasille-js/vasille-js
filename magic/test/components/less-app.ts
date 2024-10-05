import {TagOptions, v, VComponent} from "vasille-less";

interface myOpts extends TagOptions<"video"> {
    "inp-ut" : string
    return ?: {
        y: number,
        x: string
    }
}

export const LessApp : VComponent<myOpts> = v.component((input) => {
    console.log(input);

    return {
        y: 23,
        x: '',
    }
})
