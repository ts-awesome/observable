import {ObservableLike, Operator} from "./interfaces";
import {cancellation, ifCallable, isOf} from "./utils";
import {Observable} from "./observable";

export type ElementType<T> = T extends any[] ? T[number] : T;

export function of<T>(...items: ReadonlyArray<T>): Observable<T> {
  return new (ifCallable(this, Observable))(({next, complete}) => {
    items.forEach(value => next(value));
    complete();
  } )
}

export function from<T>(obj: Iterable<T> | Iterator<T> | AsyncIterable<T> | ReadonlyArray<T> | ObservableLike<T>): Observable<T> {
  const contructor = ifCallable(this, Observable);

  if (isOf(obj, contructor)) {
    return obj as any;
  }

  const observable = obj?.[Symbol.observable];
  if (observable != null) {
    const value = observable?.();

    if (typeof value === 'function') {
      return value();
    }

    if (!value || typeof value !== 'object') {
      throw TypeError(`Result should be function or Observable`);
    }

    if (isOf(value, contructor)) {
      return value;
    }

    return new contructor(s => value.subscribe(s));
  }

  const asyncIterator = obj?.[Symbol.asyncIterator];
  if (asyncIterator) {
    return new contructor(({next, complete, error}) => {
      const {
        cancel,
        token,
        promise
      } = cancellation<any>();

      try {
        return cancel;
      } finally {
        (async () => {
          const iterator: AsyncIterator<T> = obj[Symbol.asyncIterator]();
          try {
            while (true) {
              const {done, value} = await Promise.race([iterator.next(), promise]);
              if (done) {
                complete();
                break;
              }

              next(value);
            }
          } catch (e) {
            if (e !== token) {
              error(e);
            }
          }
        })();
      }
    })
  }

  if (obj?.[Symbol.iterator] || typeof (<any>obj).next === 'function' || Array.isArray(obj)) {
    return of.call(this, ...(obj as Iterable<T>));
  }

  throw TypeError('Expected ObservableLike or Iterable');
}

export function concat<T>(...objs: ReadonlyArray<ObservableLike<T>>): Observable<T> {
  return new Observable<T>(({next, complete, error}) => {
    const {
      cancel,
      token,
      promise,
    } = cancellation();

    try {
      return cancel;
    } finally {
      (async () => {
        try {
          for (let obj of objs) {
            await Promise.race([promise, from(obj).forEach((value: T) => next(value))]);
          }
        } catch (e) {
          if (e !== token) {
            error(e);
          }
        }
        complete();
      })();
    }
  })
}

export function race<T>(...objs: ReadonlyArray<ObservableLike<T>>): Observable<T> {
  return new Observable<T>(({next, complete, error}) => {
    const {
      cancel,
      token,
      promise,
    } = cancellation();

    const promises = [promise];
    for(let obj of objs) {
      promises.push(from(obj).forEach(next));
    }

    try {
      return cancel
    } finally {
      (async () => {
        try {
          await Promise.all(promises);
        } catch (e) {
          if (e !== token) {
            error(e);
          }
        }

        complete();
      })();
    }
  })
}

export function map<T, U>(fn: (value: T) => U): Operator<T, U> {
  return function map(source: ObservableLike<T>) {
    return new Observable<U>(({complete, error, next}) =>
      from(source)
        .subscribe({
          complete,
          error,
          next(value: T) {
            return next(fn(value));
          }
        })
    );
  }
}

export function filter<T>(fn: (value: T) => boolean): Operator<T, T> {
  return function filter(source: ObservableLike<T>) {
    return new Observable<T>(({complete, error, next}) =>
      from(source)
        .subscribe({
          complete,
          error,
          next(value: T) {
            if (fn(value)) {
              next(value);
            }
          }
        })
    );
  }
}

export function reduce<T, U>(fn: (acc: U | undefined, value: T) => U): Operator<T, U | undefined> {
  return function reduce(source: ObservableLike<T>) {
    return new Observable<U | undefined>(({complete, error, next}) => {
      let acc: U | undefined;
      return from(source)
        .subscribe({
          error,
          next(value: T) {
            try {
              acc = fn(acc, value);
            } catch (e) {
              error(e);
            }
          },
          complete() {
            next(acc);
            complete();
          }
        });
    })
  }
}

export function flatMap<T extends any[]>(): Operator<T, ElementType<T>> {
  return function flatMap(source: ObservableLike<T>) {
    return new Observable(({complete, error, next}) =>
      from(source)
        .subscribe({
          error,
          complete,
          next(value: T) {
            of(...value).forEach(next);
          }
        })
    );
  }
}

/* tslint:disable:max-line-length */
export function pipe<T>(): Operator<T, T>;
export function pipe<T, A>(op1: Operator<T, A>): Operator<T, A>;
export function pipe<T, A, B>(op1: Operator<T, A>, op2: Operator<A, B>): Operator<T, B>;
export function pipe<T, A, B, C>(op1: Operator<T, A>, op2: Operator<A, B>, op3: Operator<B, C>): Operator<T, C>;
export function pipe<T, A, B, C, D>(op1: Operator<T, A>, op2: Operator<A, B>, op3: Operator<B, C>, op4: Operator<C, D>): Operator<T, D>;
export function pipe<T, A, B, C, D, E>(op1: Operator<T, A>, op2: Operator<A, B>, op3: Operator<B, C>, op4: Operator<C, D>, op5: Operator<D, E>): Operator<T, E>;
export function pipe<T, A, B, C, D, E, F>(op1: Operator<T, A>, op2: Operator<A, B>, op3: Operator<B, C>, op4: Operator<C, D>, op5: Operator<D, E>, op6: Operator<E, F>): Operator<T, F>;
export function pipe<T, A, B, C, D, E, F, G>(op1: Operator<T, A>, op2: Operator<A, B>, op3: Operator<B, C>, op4: Operator<C, D>, op5: Operator<D, E>, op6: Operator<E, F>, op7: Operator<F, G>): Operator<T, G>;
export function pipe<T, A, B, C, D, E, F, G, H>(op1: Operator<T, A>, op2: Operator<A, B>, op3: Operator<B, C>, op4: Operator<C, D>, op5: Operator<D, E>, op6: Operator<E, F>, op7: Operator<F, G>, op8: Operator<G, H>): Operator<T, H>;
export function pipe<T, A, B, C, D, E, F, G, H, I>(op1: Operator<T, A>, op2: Operator<A, B>, op3: Operator<B, C>, op4: Operator<C, D>, op5: Operator<D, E>, op6: Operator<E, F>, op7: Operator<F, G>, op8: Operator<G, H>, op9: Operator<H, I>): Operator<T, I>;
export function pipe<T, A, B, C, D, E, F, G, H, I>(op1: Operator<T, A>, op2: Operator<A, B>, op3: Operator<B, C>, op4: Operator<C, D>, op5: Operator<D, E>, op6: Operator<E, F>, op7: Operator<F, G>, op8: Operator<G, H>, op9: Operator<H, I>, ...operations: Operator<any, any>[]): Operator<T, unknown>;
/* tslint:enable:max-line-length */

export function pipe<T>(...ops: Operator<any, any>[]): Operator<T, unknown> {
  return function pipe(obj: ObservableLike<T>) {
    return ops.length ? ops.reduce((acc, op) => op(acc), from(obj)) : from(obj);
  }
}
