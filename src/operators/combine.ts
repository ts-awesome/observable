import {ObservableLike, Observer} from "../interfaces";
import {Observable} from "../observable";
import {ifCallable} from "../utils";
import {from} from "./from";

export function combine(...objs: ReadonlyArray<ObservableLike<any>>): Observable<Array<any>> {
  const constructor = ifCallable(this, Observable);
  return new constructor<Array<any>>(({next, complete, error}) => {
    const result = Array(objs.length);
    const subs = objs.map((obj, index) =>
      from(obj)
        .subscribe(Object.freeze<Observer<any>>({
          next(value) {
            result[index] = value;
            if (result.every(x => x !== void 0)) {
              next(result);
            }
          },
          complete,
          error,
        }))
    );

    return () => subs.forEach(sub => sub.unsubscribe());
  });
}
