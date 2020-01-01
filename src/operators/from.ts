import {ObservableLike, Subscribable} from "../interfaces";
import {Observable} from "../observable";
import {ifCallable, isOf, methodOf} from "../utils";

export function from<T>(obj: ObservableLike<T> | Iterable<T> | AsyncIterable<T>): Observable<T> {
  const constructor = ifCallable(this, Observable);

  if (isOf(obj, constructor)) {
    return obj as any;
  }

  const subscribable = methodOf(obj as Subscribable<T>, 'subscribe');
  if (subscribable) {
    return new constructor<T>(subscriber => subscribable(subscriber));
  }

  const observable = obj?.[Symbol.observable];
  if (typeof observable === 'function') {
    const value = observable.call(obj);

    if (typeof value === 'function') {
      return value();
    }

    if (!value || typeof value !== 'object') {
      throw TypeError(`Result should be function or Observable`);
    }

    if (isOf(value, constructor)) {
      return value;
    }

    return new constructor(s => value.subscribe(s));
  }

  const asyncIterator = obj?.[Symbol.asyncIterator];
  if (asyncIterator) {
    return fromAsyncIterable.call(this, asyncIterator)
  }

  if (obj?.[Symbol.iterator] || Array.isArray(obj) || typeof (<any>obj).next === 'function') {
    return fromIterable.call(this, obj);
  }

  throw TypeError('Expected ObservableLike, Iterable or AsyncIterable');
}

export function fromIterable<T>(iterable: Iterable<T>): Observable<T> {
  const constructor = ifCallable(this, Observable);
  return new constructor<T>(({next, complete}) => {
    for (let value of iterable) {
      next(value);
    }
    complete();
  });
}

export function fromAsyncIterable<T>(iterable: AsyncIterable<T>): Observable<T> {
  const constructor = ifCallable(this, Observable);
  return new constructor<T>(({next, complete, error}) => {
    let cancelled = false;

    try {
      return () => {cancelled = true};
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
