import parser from "@babel/parser";

const code = `const a = 2; export let b = 3; var c = 4;`;

const parsed = (parser.parse(code, {sourceType: "module"}));

console.log(JSON.stringify(parsed, null, 2));
