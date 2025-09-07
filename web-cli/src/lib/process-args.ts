import { argv } from "node:process";
import select from "@inquirer/select";

export async function processArgs() {
    function checkArg(name: string) {
        return argv.indexOf(name) >= 2;
    }

    let dev = checkArg("dev");
    let build = checkArg("build");
    let spa = checkArg("spa");
    let ssg = checkArg("static");
    let help = false;

    if (!dev && !build) {
        const mode = await select<"dev" | "build">({
            message: "Select action",
            choices: [
                {
                    value: "dev",
                    name: "Start a development server",
                    description: "Select this option to open your application in web browser",
                },
                {
                    value: "build",
                    name: "Build your application",
                    description: "Select this option to compile your code for production",
                },
            ],
        });

        dev = mode === "dev";
        build = mode === "build";
        help = true;
    }
    if (build && !(spa || ssg)) {
        const target = await select<"spa" | "ssg">({
            message: "Select build type",
            choices: [
                {
                    value: "spa",
                    name: "Build a SPA",
                    description: "Select this option to build a Single Page Application with build-in router",
                },
                {
                    value: "ssg",
                    name: "Build a static site",
                    description: "Select this option to build static pages of application as HTML files.",
                },
            ],
        });

        spa = target === "spa";
        ssg = target === "ssg";
        help = true;
    }

    return { dev, build, spa, ssg, help };
}
