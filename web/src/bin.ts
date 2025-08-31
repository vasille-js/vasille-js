#!/usr/bin/env node
import { cwd, exit } from "node:process";
import { readFileSync } from "fs";
import path from "node:path";

const packageJsonPath = path.join(cwd(), "./package.json");
let content: string | undefined = undefined;

try {
    content = readFileSync(packageJsonPath, "utf8");
} catch (e) {
    console.error("Failed to read package.json", e);
    exit(1);
}

let parsed: unknown;

try {
    parsed = JSON.parse(content);
} catch (e) {
    console.error("Failed to parse package.json", e);
    exit(2);
}

if (
    parsed &&
    typeof parsed === "object" &&
    "devDependencies" in parsed &&
    parsed.devDependencies &&
    typeof parsed.devDependencies === "object" &&
    "vasille-web-cli" in parsed.devDependencies
) {
    import(path.join(cwd(), "./node_modules/vasille-web-cli/bin/run.js"));
} else {
    console.info("Vasille Web CLI is not installed. Please run `npm install --save-dev vasille-web-cli`");
    exit(1);
}
