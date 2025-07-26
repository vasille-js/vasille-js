import {  runTest } from "../run-test";

it('no import', function() {
  runTest(__dirname, "no-import")
})

it('web global import', function() {
  runTest(__dirname, "web-global")
})

it('web style only import', function() {
  runTest(__dirname, "web-partial")
})
