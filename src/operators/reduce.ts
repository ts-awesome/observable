import {ObservableLike, Observer, Operator} from "../interfaces";
import {Observable} from "../observable";
import {from} from "./from";

export function reduce<T, U>(fn: (acc: U | undefined, value: T) => U): Operator<T, U | undefined> {
  return function reduce(source: ObservableLike<T>) {
    return new Observable<U | undefined>(({complete, error, next}) => {
      let acc: U | undefined;
      return from(source)
        .subscribe(Object.freeze<Observer<T>>({
          error,
          next(value: T) {
            try {
              acc = fn(acc, value);
            } catch (e) {
              error(e);
            }
          },
          complete() {
            next(acc);
            complete();
          }
        }));
    })
  }
}
