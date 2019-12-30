import {ObservableLike, Operator} from "./interfaces";
import {ifCallable} from "./utils";
import {Observable} from "./observable";

export type ElementType<T> = T extends any[] ? T[number] : T;

export function of<T>(...items: ReadonlyArray<T>): Observable<T> {
  return new (ifCallable(this, Observable))(({next, complete}) => {
    items.forEach(value => next(value));
    complete();
  } )
}

export function from<T>(obj: Iterable<T> | Iterator<T> | AsyncIterable<T> | ReadonlyArray<T> | ObservableLike<T>): Observable<T> {
  if (obj?.hasOwnProperty(Symbol.observable)) {
    const value = obj[Symbol.observable]();

    if (typeof value === 'function') {
      return value();
    }

    if (!value || typeof value !== 'object') {
      throw TypeError();
    }

    if (value.constructor === (typeof this === 'function' ? this : Observable)) {
      return value;
    }

    return new (ifCallable(this, Observable))(s => value.subscribe(s));
  }

  if (obj?.hasOwnProperty(Symbol.asyncIterator)) {
    return new (ifCallable(this, Observable))(async ({next, complete, error}) => {
      const iterator: AsyncIterator<T> = obj[Symbol.asyncIterator]();
      while (true) {
        try {
          const {done, value} = await iterator.next();
          if (done) {
            complete();
            break;
          }

          next(value);
        } catch (e) {
          error(e);
          break;
        }
      }
    })
  }

  if (obj?.hasOwnProperty(Symbol.iterator) || typeof (<any>obj).next === 'function' || Array.isArray(obj)) {
    return of.call(this, ...(obj as Iterable<T>));
  }

  throw TypeError('Expected ObservableLike or Iterable');
}

export function concat<T>(...objs: ReadonlyArray<ObservableLike<T>>): Observable<T> {
  return new Observable<T>(async ({next, complete, error}) => {
    for(let obj of objs) {
      await from(obj).forEach((value: T) => next(value));
    }
    complete();
  })
}

export function race<T>(...objs: ReadonlyArray<ObservableLike<T>>): Observable<T> {
  return new Observable<T>(async ({next, complete, error}) => {
    const promises = [];
    for(let obj of objs) {
      promises.push(from(obj).forEach(next));
    }

    try {
      await Promise.all(promises);
    } catch (e) {
      error(e);
    }

    complete();
  })
}

export function map<T, U>(fn: (value: T) => U | Promise<U>): Operator<T, U> {
  return (source: ObservableLike<T>) => new Observable<U>(({complete, error, next}) =>
    from(source).subscribe({complete, error, async next(value: T) {
      next(await fn(value));
    }}))
}
export function filter<T>(fn: (value: T) => boolean | Promise<boolean>): Operator<T, T> {
  return (source: ObservableLike<T>) => new Observable(({complete, error, next}) =>
    from(source).subscribe({complete, error, async next(value: T) {
      if (await fn(value)) { next(value); }
    }}))
}
export function reduce<T, U>(fn: (acc: U | undefined, value: T) => U | Promise<U>): Operator<T, U | undefined> {
  return (source: ObservableLike<T>) => new Observable(({complete, error, next}) => {
    let acc: U | undefined;
    from(source).subscribe({error, async next(value: T) {
      acc = await fn(acc, value);
    }, complete() {
      next(acc);
      complete();
    }})
  })
}
export function flatMap<T>(): Operator<T, ElementType<T>> {
  return (source: ObservableLike<T>) => new Observable(({complete, error, next}) =>
    from(source).subscribe({error, complete, async next(value: T) {
      await of(value).forEach(next);
    }}));
}
