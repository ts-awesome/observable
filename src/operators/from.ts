import {ObservableLike, Subscribable} from "../interfaces";
import {Observable} from "../observable";
import {ifCallable, isOf, methodOf} from "../utils";
import {fromAsyncIterable} from "./from-async-iterable";

export function from<T>(obj: ObservableLike<T> | Iterable<T> | AsyncIterable<T>): Observable<T> {
  const constructor = ifCallable<typeof Observable>(this, Observable);

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

  if (isIterable(obj)) {
    return new constructor<T>(({next, complete}) => {
      for (const value of obj) {
        next(value);
      }
      complete();
    });
  }

  throw TypeError('Expected ObservableLike, Iterable or AsyncIterable');
}

function isIterable<T=any>(x: unknown): x is Iterable<T> {
  return Array.isArray(x)
    || (typeof x === 'object' && x !== null
      && (x?.[Symbol.iterator] != null
        || (hasOwnProperty(x, 'next') && typeof x.next === 'function')));
}

// eslint-disable-next-line @typescript-eslint/ban-types
function hasOwnProperty<X extends Object, Y extends PropertyKey>(obj: X, prop: Y): obj is X & Record<Y, unknown> {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}
