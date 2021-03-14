import {Observable} from "../observable";
import {ifCallable} from "../utils";

export function of<T>(...items: ReadonlyArray<T>): Observable<T> {
  const constructor = ifCallable<typeof Observable>(this, Observable);
  return new constructor<T>(({next, complete}) => {
    items.forEach(value => next(value));
    complete();
  })
}
