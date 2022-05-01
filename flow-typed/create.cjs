const fs = require("fs");

/**
 * @param dir {Dir}
 */
function search(dir)  {
    let dirent = dir.readSync();

    while (dirent !== null) {
        if (dirent.isDirectory()) {
            search(fs.opendirSync(dir.path + '/' + dirent.name));
        }
        else if (dirent.isFile() && /\.d\.ts$/.test(dirent.name) && dirent.name !== 'index.d.ts') {
            extract(dir.path + '/' + dirent.name);
        }

        dirent = dir.readSync();
    }
}

/**
 * @param path {string}
 */
function extract(path) {
    const content = fs.readFileSync(path);
    const test = content.toString("utf-8");
    const lines = test.split('\n').filter(line => !/^import\s/.test(line));

    lines.forEach((line, index) => {
        let l = line;

        // replace 'export declare' with declare
        if (/export declare \w+/.test(l)) {
            l = l.replace(/export (declare)/, '$1')
        }
        // replace 'export interface' with 'declare interface'
        if (/export interface \w+/.test(l)) {
            l = l.replace(/export (interface)/, 'declare $1')
        }
        // add 'declare' before interface
        if (/(?<!declare )interface \w+/.test(l)) {
            l = l.replace('interface', 'declare interface')
        }
        // remove private|public|protected
        if (/(private|public|protected) (readonly\s+)?[\w$]+/.test(l)) {
            l = l.replace(/(private|public|protected) (readonly\s)?([\w$]+)/, '$3');
        }
        // remove empty exports
        if (/export {};/.test(l)) {
            l = '';
        }
        // replace unknown by any
        if (/\bunknown\b/.test(l)) {
            l = l .replace(/\bunknown\b/, 'any');
        }

        // add any type to variables without a type
        if (/^\s*\w+;$/.test(l)) {
            l = l.replace(/;$/, ": any;");
        }
        // add void type to functions without a type
        if (/^\s*(set)?\s+[\w$]+\(.*\);$/.test(l)) {
            l = l.replace(/;$/, ": void;");
        }
        // add void type to functions without a type
        if (/^\s*\w+\(.*{$/.test(l)) {
            let i = index + 1;

            while (!/^\s*}\)(\s*:.*)*;$/.test(lines[i])) {
                i++;
            }

            if (/}\);$/.test(lines[i])) {
                lines[i] = lines[i].replace(/;$/, ' : void;');
            }
        }

        // remove imports
        if (/import\(.*\)\./.test(l)) {
            l = l.replace(/import\(.*\)\./, '');
        }

        // Replace template type with constrains
        if (/<(.+,)*\s*(\w+) extends (<.*?>|[^,])+(,.+)*>( extends )/.test(l)) {
            l = l.replace(/<(.+,)*\s*(\w+) extends (<.*?>|[^,])+(,.+)*>( extends )/, "<$1$2$4>$5");
        }
        if (/^\s*(declare function )?\w+<(.+,)*\s*(\w+) extends (<.*?>|[^,])+(,.+)*>\(/.test(l)) {
            l = l.replace(/^(\s*(?:declare function )?\w+)<(.+,)*\s*(\w+) extends (<.*?>|[^,])+(,.+)*>\(/, "$1<$2$3$5>(");
        }
        // replace object representations
        if (/\[\s*(\w+) in keyof (?:\[.*?\]|[^\]])+\]\s*(\?)?:/.test(l)) {
            l = l.replace(/\[\s*(\w+) in keyof (?:\[.*?\]|[^\]])+\]\s*(\?)?:/, '[$1 : string]:$2');
        }

        // replace types with flow doesn't understand
        if (/ \| `\${number}.*?`/.test(l)) {
            l = l.replace(/ \| `\${number}.*?`/g, '');
        }

        // make KindOfIValue = any[]
        if (/declare type KindOfIValue/.test(l)) {
            lines.splice(index, 2);
            l = 'declare type KindOfIValue<T> = any[];';
        }
        // make ExtractParams = any[]
        if (/declare type ExtractParams/.test(l)) {
            l = 'declare type ExtractParams = any[];'
        }
        // replace const and let by var
        if (/declare (const|let)\b/.test(l)) {
            l = l.replace(/declare (const|let)\b/, 'declare var');
        }

        if (l !== line) {
            lines[index] = l;
        }
    });

    fs.appendFileSync(vasille_js_file, lines.join('\n') + '\n\n');
}

const dir = fs.opendirSync('./types');
const vasille_js_file = __dirname + '/vasille.js';

if (fs.existsSync(vasille_js_file)) {
    fs.rmSync(vasille_js_file);
}

fs.appendFileSync(vasille_js_file,
    'declare module "vasille" {\n' +
    'declare type Record<K, T> = {[k : K] : T};\n'
);
search(dir);

fs.appendFileSync(vasille_js_file,'}\n');

