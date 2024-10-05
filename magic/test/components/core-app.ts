import {Component, TagOptions} from "vasille";

interface myOpts extends TagOptions<"video"> {
    "inp-ut" : string
    return ?: {
        y: number,
        s: string
    }
}

export class CoreApp extends Component<myOpts> {
    protected compose(input: myOpts) {
        super.compose(input);

        return {
            y: 2,
            s: '',
        }
    }
}
