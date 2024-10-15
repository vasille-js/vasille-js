import {IValue} from "vasille";

type Path = (string|number)[];

export function readProperty(o: unknown, path: Path): unknown {
  //
}

export function writeValue(o: unknown, path: Path, v: unknown) {
  //
}

export class PropertyExtractor implements IValue<unknown> {
  source: IValue<unknown>;
  path: Path;
}
