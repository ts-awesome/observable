import {Observable} from "../observable";
import {ifCallable} from "../utils";

export function fromPromise<T>(promised: Promise<T> | PromiseLike<T>): Observable<T> {
  const constructor = ifCallable<typeof Observable>(this, Observable);
  return new constructor<T>(({next, complete, error}) => {
    (async () => {
      try {
        next(await promised);
      } catch (e) {
        error(e)
      } finally {
        complete();
      }
    })().catch(error);
  });
}
