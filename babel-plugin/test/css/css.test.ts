import { runTest, throwTest } from "../run-test";

it("style test", function () {
  runTest(__dirname, "style");
});

it('object method', function() {
  throwTest(__dirname, "object-method", 'Object methods not supported here');
})

it('spread element in object', function() {
  throwTest(__dirname, "object-spread-element", 'Spread element not supported here');
})

it('theme is defined twice', function() {
  throwTest(__dirname, "theme-twice", 'The theme seems the be defined twice');
})

it('theme name is not string literal', function() {
  throwTest(__dirname, "theme-not-string", 'Expected string literal');
})

it('dark conflict with themes', function() {
  throwTest(__dirname, "dark-vs-theme", 'The theme seem the be defined twice');
})

it('spread element in array', function() {
  throwTest(__dirname, "dark-vs-theme", 'The theme seem the be defined twice');
})

it('wrong array value', function() {
  throwTest(__dirname, "wrong-array-value", 'Only numbers arrays are supported here');
})

it('wrong style value', function() {
  throwTest(__dirname, "wrong-value", 'Failed o parse value, it is not a string, number or array');
})

it('incompatible key', function() {
  throwTest(__dirname, "incompatible-key", 'Incompatible key, expect identifier or string literal');
})

it('computed key', function() {
  throwTest(__dirname, "computed-key", 'Computed keys are not supported');
})

it('nested media queries', function() {
  throwTest(__dirname, "nested-media-queries", 'Media queries allowed only in the root of style');
})

it('media value is not object', function() {
  throwTest(__dirname, "media-not-object", 'Expected object expression');
})

it('recursive pseudos', function() {
  throwTest(__dirname, "nested-pseudos", 'Recursive pseudo classes are restricted');
})

it('pseudo value is not object', function() {
  throwTest(__dirname, "pseudo-not-object", 'Expected object expression');
})
