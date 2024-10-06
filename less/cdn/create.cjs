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
        else if (dirent.isFile() && /\.js$/.test(dirent.name)) {
            extract(dir.path + '/' + dirent.name);
        }

        dirent = dir.readSync();
    }
}

const addedClasses = new Set;
const fileQueue = new Array;
const fileList = [];

const predefined = ['Map', 'Set', 'Object', 'Array'];

/**
 * @param path {string}
 */
function extract(path) {
    const content = fs.readFileSync(path);
    const test = content.toString("utf-8");
    const lines = test.split('\n').filter(line => !/^import\s/.test(line));
    const classes = new Set;

    const after = /\/(v|functional)\//;
    let needRepeat = after.test(path) && !fileQueue.every(path => after.test(path));

    lines.forEach((line, index) => {
        const parentMath = line.match(/class (\w+) extends (\w+)\b/);

        if (parentMath &&
            !addedClasses.has(parentMath[2]) &&
            !classes.has(parentMath[2]) &&
            !predefined.includes(parentMath[2])) {
            needRepeat = true;
        }

        const match = line.match(/export (class|const|function) (\w+)/);

        if (match) {
            classes.add(match[2]);
            lines.splice(index, 1, line.replace(/export (class|const|function)/, '$1'));
        }
        else {
            if (parentMath) {
               addedClasses.add(parentMath[1]);
            }
            if (/^export /.test (line)) {
                lines.splice (index, 1, '');
            }
        }
    });

    if (fileQueue.includes(path)) {
        fileQueue.splice(fileQueue.indexOf(path), 1);
    }

    if (needRepeat) {
        fileQueue.push(path);
    }
    else {
        fileList.push(path);
        lines.unshift('// ' + path);
        classes.forEach(cl => lines.push('window.' + cl + ' = ' + cl + ';'));
        fs.appendFileSync(es6, lines.join('\n') + '\n\n');

        classes.forEach(cl => addedClasses.add(cl));
    }
}

const dir = fs.opendirSync('./lib');
const es6 = __dirname + '/es2015.js';

if (fs.existsSync(es6)) {
    fs.rmSync(es6);
}

fs.appendFileSync(es6,'(function(){\n');
search(dir);

while (fileQueue.length) {
    extract(fileQueue[0]);
}

fs.appendFileSync(es6,'})();\n');
