import { routerApp } from "../src/index.js";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { ScreenProps } from "vasille-router";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function runTest(screen: (props: ScreenProps<string>) => Promise<void>, filename: string) {
    const router = routerApp({
        routes: { "/": { screen } },
    });

    expect((await router.render())["/index.html"]).toBe(
        await readFile(path.join(__dirname, filename + ".tsx.html"), "utf8"),
    );
}
