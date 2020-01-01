import {ObservableLike, Observer, Operator} from "../interfaces";
import {Observable} from "../observable";
import {from} from "./from";
import {of} from "./of";

export function flatten<T extends any[]>(): Operator<T, T[number]> {
  return function flatten(source: ObservableLike<T>) {
    return new Observable(({complete, error, next}) =>
      from(source)
        .subscribe(Object.freeze<Observer<T>>({
          error,
          complete,
          next(value: T) {
            of(...value).forEach(next);
          }
        }))
    );
  }
}
