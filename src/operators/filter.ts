import {ObservableLike, Observer, Operator} from "../interfaces";
import {Observable} from "../observable";
import {from} from "./from";

export function filter<T>(fn: (value: T) => boolean): Operator<T, T> {
  return function filter(source: ObservableLike<T>) {
    return new Observable<T>(({complete, error, next}) =>
      from(source)
        .subscribe(Object.freeze<Observer<T>>({
          complete,
          error,
          next(value: T) {
            if (fn(value)) {
              next(value);
            }
          }
        }))
    );
  }
}
