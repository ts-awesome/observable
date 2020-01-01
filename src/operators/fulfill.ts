import {Observable} from "../observable";
import {ObservableLike, Observer, Operator} from "../interfaces";
import {from} from "./from";

export function fulfill<T>(): Operator<PromiseLike<T>, T> {
  return function fulfill(obj: ObservableLike<PromiseLike<T>>): Observable<T> {
    return new Observable<T>(({complete, error, next}) =>
      from(obj)
        .subscribe(Object.freeze<Observer<PromiseLike<T>>>({
          next(value) {
            (async () => {
              try {
                next(await value);
              } catch (e) {
                error(e);
              }
            })().catch(error);
          },
          error,
          complete,
        }))
    );
  };
}
