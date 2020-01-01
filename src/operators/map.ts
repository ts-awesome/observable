import {ObservableLike, Observer, Operator} from "../interfaces";
import {Observable} from "../observable";
import {from} from "./from";

export function map<T, U>(fn: (value: T) => U): Operator<T, U> {
  return function map(source: ObservableLike<T>) {
    return new Observable<U>(({complete, error, next}) =>
      from(source)
        .subscribe(Object.freeze<Observer<T>>({
          complete,
          error,
          next(value: T) {
            next(fn(value));
          }
        }))
    );
  }
}
