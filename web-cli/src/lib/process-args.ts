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
    let lib = checkArg("lib");
    let components = checkArg("components");
    let devLib = checkArg("dev+lib") || checkArg("lib+dev");
    let help = false;

    if (devLib) {
        dev = true;
        lib = true;
    }

    if (!dev && !build) {
        const mode = await select<"dev" | "build" | "dev+lib">({
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
                {
                    value: "dev+lib",
                    name: "Start a development server for library",
                    description: "Select this option to start a hot reload development server for library",
                },
            ],
        });

        dev = mode === "dev" || mode === "dev+lib";
        build = mode === "build";
        lib = mode === "dev+lib";
        help = true;
    }
    if (build && !(spa || ssg || lib || components)) {
        const target = await select<"spa" | "ssg" | "lib" | "components">({
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
                {
                    value: "lib",
                    name: "Build a component library",
                    description: "Select this option to build a library, which can be used in SPA or SSG.",
                },
                {
                    value: "components",
                    name: "Build a web components library",
                    description: "Select this option to build a library, which can be used in any frontend framework.",
                },
            ],
        });

        spa = target === "spa";
        ssg = target === "ssg";
        help = true;
    }

    return { dev, build, spa, ssg, help, lib, components };
}
