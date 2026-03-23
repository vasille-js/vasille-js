import path from "node:path";
import { fileURLToPath } from "node:url";
import { routerApp } from "vasille-ssg";
import { readFile } from "node:fs/promises";
import index from "./index.js";
import embed from "./embed.js";
import fileHtml from "./file-html.js";

it("router test", async () => {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const router = routerApp(
        {
            routes: {
                "/": { screen: index },
                "/test/embed": { screen: embed },
                "/test/embed/file.html": { screen: fileHtml },
            },
        },
        "html",
    );
    const rendered = await router.render();

    expect(rendered["/index.html"]).toBe(await readFile(path.join(__dirname, "index.html"), "utf8"));
    expect(rendered["test/embed/index.html"]).toBe(await readFile(path.join(__dirname, "embed.html"), "utf8"));
    expect(rendered["test/embed/file.html"]).toBe(await readFile(path.join(__dirname, "file.html"), "utf8"));
});
