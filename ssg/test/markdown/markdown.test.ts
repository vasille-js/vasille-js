import { runMarkDownTest, runHybridTest } from "../run-test.js";
import blocks from "./blocks.tsx";
import css from "./css.tsx";
import external from "./external.tsx";
import heading from "./heading.tsx";
import hybrid from "./hybrid.tsx";
import lists from "./lists.tsx";
import stylish from "./stylish.tsx";
import table from "./table.tsx";

it("blocks", async function () {
    await runMarkDownTest(blocks, "markdown/blocks");
});

it("css", async function () {
    await runMarkDownTest(css, "markdown/css");
});

it("external", async function () {
    await runMarkDownTest(external, "markdown/external");
});

it("heading", async function () {
    await runMarkDownTest(heading, "markdown/heading");
});

it("hybrid", async function () {
    await runHybridTest(hybrid, "markdown/hybrid");
});

it("lists", async function () {
    await runMarkDownTest(lists, "markdown/lists");
});

it("stylish", async function () {
    await runMarkDownTest(stylish, "markdown/stylish");
});

it("table", async function () {
    await runMarkDownTest(table, "markdown/table");
});
