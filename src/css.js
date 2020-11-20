// @flow
import type { BaseNode } from "./node";



export class CssCompozitor {
    scopedClass ( node : BaseNode, id : string ) : Array<string> {
        throw "Must be overwritten";
    }

    initStyle ( node : BaseNode ) {
        throw "Must be overwritten";
    }
}

export class CssDebugCompozitor extends CssCompozitor {
    scopedClass ( node : BaseNode, id : string ) : Array<string> {
        return [node.rt.constructor.name + '-' + id.replace(/^vs-/, '')];
    }

    $inited : { [key : string] : boolean } = {};

    styleToString ( style : Object, node : BaseNode ) : string {
        let css = '\n';

        for (let i in style) {
            let selector = i.replace(/\.[^\s.:#]+/, ( found ) => {
                return '.' + this.scopedClass(node, found.substr(1))[0];
            });
            let rules = style[i];

            css += selector + ' {\n';

            for (let i in rules) {
                css += '  ' + i + ': ' + rules[i] + '\n';
            }

            css += '}\n';
        }

        return css;
    }

    initStyle ( node : BaseNode ) {
        let nodeId = node.rt.constructor.name;

        if (this.$inited[nodeId]) return;

        let style = node.createCss();
        let responsive = node.createReposiveCss();
        let css = "";

        let tag = document.createElement('style');
        tag.setAttribute('type', 'text/css');
        tag.setAttribute('data-node', nodeId);

        css += this.styleToString(style, node);

        for (let i in responsive) {
            css += "@media " + i + " {\n";
            css += this.styleToString(responsive[i], node);
            css += "}\n";
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
