#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prompts_1 = __importDefault(require("prompts"));
const degit_1 = __importDefault(require("degit"));
const fs_1 = __importDefault(require("fs"));
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield (0, prompts_1.default)([
            {
                type: "text",
                name: "name",
                message: "What is name of your app?"
            },
            {
                type: "select",
                name: "lang",
                message: "Select desired language",
                choices: [
                    {
                        title: 'TypeScript',
                        description: 'Include power of typescript',
                        value: 'ts'
                    },
                    {
                        title: "JavaScript",
                        description: 'Keep it simple',
                        value: 'js'
                    }
                ]
            },
            {
                type: "select",
                name: "package",
                message: "Select desired package to install",
                choices: [
                    {
                        title: "Framework",
                        description: "Install and update all official libs at once",
                        value: "full"
                    },
                    {
                        title: "Independent",
                        description: "Install minimal number of libraries",
                        value: "lib"
                    }
                ]
            }
        ]);
        if (!response.name) {
            throw new Error('App name can not be empty');
        }
        fs_1.default.mkdirSync(response.name);
        const repo = `example${response.package === 'lib' ? '-lib' : ''}-${response.lang === 'ts' ? 'type' : 'java'}script`;
        yield new Promise((resolve) => {
            const emitter = (0, degit_1.default)('vasille-js/' + repo, {
                cache: false,
                verbose: true,
            });
            emitter.clone(response.name).then(() => {
                resolve();
            });
        });
        const data = JSON.parse(fs_1.default.readFileSync(`${response.name}/package.json`, { encoding: 'utf8' }));
        data.name = response.name;
        fs_1.default.writeFileSync(`${response.name}/package.json`, JSON.stringify(data, null, 4));
        console.log('\x1b[32mSuccess!\x1b[0m');
        console.log(`run\x1b[34m cd ${response.name} && npm i && npm run dev\x1b[0m to start developing.`);
    });
}
run().catch(e => {
    console.log(e);
}).finally(() => {
    process.exit(0);
});
