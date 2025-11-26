import { compose } from "steel-frame";

let a = 1;

do {
  compose(() => {});
} while (a < 1);

compose(() => {});

for (const key in {}) {
  compose(() => {});
}

for (const value of []) {
  compose(() => {});
}

for (let i = 0; i < 10; i++) {
  compose(() => {});
}

for (a = 0; a < 10; a++) {
  compose(() => {});
}

function fn() {
  return compose(() => {});
}

if (a < 1) {
  compose(() => {});
} else {
  compose(() => {});
}

label: compose(() => {});

switch (a) {
  case 1:
    compose(() => {});
    break;

  default:
    compose(() => {});
}

try {
  throw compose(() => {});
} catch (e) {
  compose(() => {});
} finally {
  compose(() => {});
}

let L = compose(() => {});
const F = compose(() => {});

while (a < 1) {
  compose(() => {});
}
