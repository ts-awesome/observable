import {ObservableLike, Observer, Subscription} from "../interfaces";
import {Observable} from "../observable";
import {ifCallable} from "../utils";

export function concat<T>(...objs: ReadonlyArray<ObservableLike<T>>): Observable<T> {
  const constructor = ifCallable(this, Observable);
  return new constructor<T>(({next, complete, error}) => {
    const iterator = objs[Symbol.iterator]();
    let current = begin();
    return () => current?.unsubscribe();

    function begin(): Subscription | null {
      const {done, value} = iterator.next();

      if (done) {
        complete();
        return null;
      }

      return value.subscribe(Object.freeze<Observer<T>>({
        next,
        error,
        complete(): void {
          current = begin();
        }
      }))
    }
  })
}
