import pluginTester from 'babel-plugin-tester';
import vasillePlugin from '../src';
import path from 'path';

function f(path: string) {
    return {
        fixture: `${path}.ts`,
        outputFixture: `${path}.js`,
    }
}

pluginTester({
    plugin: vasillePlugin,
    fixtures: path.join(__dirname, './src'),
    tests: {
        'global import': f('import/global'),
        'selective import': f('import/selective')
    },
  });

// const babel = require("babel-core");
// const plugin = require("./test-plugin");

// var example = `
// var foo = 1;
// if (foo) console.log(foo);
// `;

// console.log(plugin);

// it("works", () => {
//     const { code } = babel.transform(example, { plugins: [plugin.default] });
//     expect(code).toMatchSnapshot();
// });
