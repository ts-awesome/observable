import {ObservableLike, Observer} from "../interfaces";
import {Observable} from "../observable";
import {ifCallable} from "../utils";
import {from} from "./from";

export function merge<T>(...objs: ReadonlyArray<ObservableLike<T>>): Observable<T> {
  const constructor = ifCallable<typeof Observable>(this, Observable);
  return new constructor<T>(({next, complete, error}) => {
    let pending = objs.length;
    const subscriber = Object.freeze<Observer<T>>({
      next,
      error,
      complete() {
        pending--;
        if (pending < 0) {
          complete();
        }
      },
    });

    const subs = objs.map(obj => from(obj).subscribe(subscriber));
    return () => subs.forEach(sub => sub.unsubscribe());
  })
}
