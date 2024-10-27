import parser from "@babel/parser";

const code = `import * as Vasille from "vasille"; import {Mount, Slot as Sxxx, compose} from "vasille-dx";`;

const parsed = (parser.parse(code, {sourceType: "module"}));

console.log(JSON.stringify(parsed, null, 2));
