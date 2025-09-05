import fs from "fs/promises";
import {checkDir} from "../lib/fs.js";
import path from "node:path";
import {Dirent} from "node:fs";

const initializationFields = ["checkAccess", "fallbackScreen", "errorScreen", "loadingScreen", "loadingOverlay"];

export async function findRoutes(routerDir: string, pagesDir: string) {
  const present: {component: string; file: string}[] = [];
  const paths: {urlPath: string; filePath: string}[] = [];

  if (await checkDir(routerDir)) {
    const dir = await fs.opendir(routerDir, { encoding: "utf-8" });
    let item: Dirent | null;

    while ((item = await dir.read())) {
      if (item.isFile()) {
        for (const field of initializationFields) {
          if (item.name.startsWith(field) && /^\w+\.[tj]sx?$/.test(item.name)) {
            present.push({component: field, file: path.join(item.parentPath, item.name)});
          }
        }
      }
    }

    await dir.close();
  }

  if (await checkDir(pagesDir)) {
    const dir = await fs.opendir(pagesDir, { recursive: true, encoding: "utf-8" });

    let item: Dirent | null;

    while ((item = await dir.read())) {
      if (item.isFile() && /\.[jt]sx?$/.test(item.name)) {
        let name = item.name.replace(/\.[tj]sx?$/, "");

        if (name === "index" || name === "index.html") {
          name = "";
        }

        const filePath = path.join(item.parentPath, item.name).replace(/\.[tj]sx?$/, "");
        const screenPath = path.join(item.parentPath, name).slice(pagesDir.length) || "/";

        console.log("Route path:", screenPath);

        paths.push({urlPath: screenPath, filePath});
      }
    }

    await dir.close();
  }

  return { paths, present };
}
