#!/usr/bin/env node
import prompts from "prompts";
import degit from "degit";
import fs from "fs";

async function run(): Promise<void> {
  const response = await prompts([
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

  fs.mkdirSync(response.name);

  const repo =  `example${response.package === 'lib' ? '-lib' : ''}-${response.lang === 'ts' ? 'type' : 'java'}script`;

  await new Promise<void>((resolve) => {
    const emitter = degit('vasille-js/' + repo, {
      cache: false,
      verbose: true,
    });

    emitter.on('info', info => {
      console.log(info.message);
    });

    emitter.clone(response.name).then(() => {
      resolve();
    });
  });

  const data = JSON.parse(fs.readFileSync(`${response.name}/package.json`, {encoding: 'utf8'}));

  data.name = response.name;

  fs.writeFileSync(`${response.name}/package.json`, JSON.stringify(data, null, 4));
}

run().catch(e => {
  console.log(e);
}).finally(() => {
  process.exit(0);
})
