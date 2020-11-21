// @flow
import type { BaseNode } from "./node";



export class CssCompozitor {
    scopedClass ( c : Function, id : string ) : Array<string> {
        throw "Must be overwritten";
    }

    initStyle ( node : BaseNode ) {
        throw "Must be overwritten";
    }
}

export class CssDebugCompozitor extends CssCompozitor {
    scopedClass ( c : Function, id : string ) : Array<string> {
        return ['vs-' + c.name + '-' + id.replace(/^vs-/, '')];
    }

    $inited : { [key : string] : boolean } = {};

    styleToString ( selector : string, rules : Object, node : BaseNode ) : string {
        let css = '';

            selector = selector.replace(/(\w*)\.((?!vs-)[^\s.:#]+)/, ( found, name, cl ) => {
                return name
                       ? '.' + this.scopedClass({name}, cl)[0]
                       : '.' + this.scopedClass(node.constructor, cl)[0];
            });

            css += selector + ' {\n';

            for (let i in rules) {
                css += '  ' + i + ': ' + rules[i] + '\n';
            }

            css += '}\n';

        return css;
    }

    initStyle ( node : BaseNode ) {
        let nodeId = node.rt.constructor.name;

        if (this.$inited[nodeId]) return;

        let style = node.createCss();
        let css = "\n";

        let tag = document.createElement('style');
        tag.setAttribute('type', 'text/css');
        tag.setAttribute('data-node', nodeId);

        for (let rule of style) {
            if (rule.media) {
                let mediaRule = "";

                for (let i of ["minW", "maxW", "minH", "maxH"]) {
                    let v = rule.media[i];
                    if (typeof v === "number") {
                        if (mediaRule.length) {
                            mediaRule += " && ";
                        }
                        mediaRule += "(" + i.replace ( "W", "-width" )
                                            .replace ( "H", "-height" )
                                     + ": " + v + "px)";
                    }
                }

                css += "@media " + mediaRule + " {\n";
                css += this.styleToString(rule.selector, rule.data, node);
                css += "}\n";
            }
            else {
                css += this.styleToString(rule.selector, rule.data, node);
            }
        }

        if (css !== '\n') {
            tag.innerHTML = css;
            if (document.head) {
                document.head.append(tag);
            }
        }

        this.$inited[nodeId] = true;
    }


}
