import {ObservableLike, Observer} from "../interfaces";
import {Observable} from "../observable";
import {ifCallable} from "../utils";
import {from} from "./from";

export function race<T>(...objs: ReadonlyArray<ObservableLike<T>>): Observable<T> {
  const constructor = ifCallable<typeof Observable>(this, Observable);
  return new constructor<T>(({next, complete, error}) => {
    const subscriber: Observer<T> = {
      next(value: T): any {
        try {
          return next(value);
        } finally {
          complete();
        }
      },
      complete,
      error
    };
    Object.freeze(subscriber);

    const subs = objs.map((obj, index) =>
      from(obj)
        .subscribe(Object.freeze<Observer<any>>({
          next(value) {
            try {
              next(value);
            } finally {
              subs.forEach((sub, i) => {
                if (i !== index) {
                  sub.unsubscribe();
                }
              })
            }
          },
          complete,
          error
        })));

    return () => subs.forEach(sub => sub.unsubscribe());
  })
}
