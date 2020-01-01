import {Observable} from "../observable";
import {ifCallable} from "../utils";

export function fromAsyncIterable<T>(iterable: AsyncIterable<T>): Observable<T> {
  const constructor = ifCallable(this, Observable);
  return new constructor<T>(({next, complete, error}) => {
    let cancelled = false;

    try {
      return () => {
        cancelled = true
      };
    } finally {
      (async () => {
        for await (let value of iterable) {
          if (cancelled) {
            break;
          }
          next(value);
        }

        complete();
      })();
    }
  });
}
