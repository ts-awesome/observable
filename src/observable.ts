import {
  Observer,
  OnComplete,
  OnError,
  OnNext,
  SubscriberFunction,
  Subscription,
} from "./interfaces";
import {ObservableSymbol} from "./symbols";
import {methodOf, rethrows} from "./utils";
import {of, from, concat, ElementType} from './operators';
import {map, filter, reduce, flatMap} from './operators';

export class Observable<T> {

  public static of = of;
  public static from = from;
  public static concat = concat;

  public forEach(fn: (value: T) => void): Promise<void> {
    return map(fn)(this).toPromise();
  }
  public map<U>(fn: (value: T) => U | Promise<U>): Observable<U>{
    return map(fn)(this);
  }
  public filter(fn: (value: T) => boolean | Promise<boolean>): Observable<T> {
    return filter(fn)(this);
  }
  public reduce<U>(fn: (acc: U | undefined, value: T) => U | Promise<U>): Observable<U | undefined> {
    return reduce(fn)(this);
  }
  public flatMap(): Observable<ElementType<T>> {
    return flatMap<T>()(this);
  }

  public toPromise(): Promise<T | undefined> {
    return new Promise((resolve, error) => {
      let last: T | undefined;
      this.subscribe({
        next(x) { last = x },
        complete() { resolve(last) },
        error})
    });
  }

  public [ObservableSymbol]() {
    return this;
  }

  constructor(private subscriber: SubscriberFunction<T>) {
    if (typeof subscriber !== 'function') {
      throw TypeError();
    }
  }

  public subscribe(observer: Observer<T>): Subscription;
  public subscribe(onNext: OnNext<T>, onError?: OnError, onComplete?: OnComplete): Subscription;
  public subscribe(obj: any): Subscription {
    if (typeof obj === 'function') {
      const [next, error, complete] = [].slice.call(arguments);
      obj = { next, error, complete };
    }

    if (typeof obj !== 'object') {
      throw TypeError();
    }

    let closed = false;
    const subscription = {
      get closed() { return closed },
      unsubscribe() {
        closed = true;
        clean?.();
      },
      toPromise() {
        return new Promise<T | undefined>((resolve, reject) => {

        });
      }
    };

    obj.start?.(subscription);

    if (closed) {
      return subscription;
    }

    let cleanup: any;
    let next: OnNext<T>;
    let error: OnError | undefined = undefined;
    let complete: OnComplete;
    try {
      cleanup = this.subscriber({
        get closed() { return closed; },
        complete: complete_,
        next: next_,
        error: error_,
      });
    } catch (e) {
      error = error ?? methodOf(obj, 'error') ?? rethrows;
      error?.(e);
    }

    if (cleanup != null && !(cleanup instanceof Promise) && typeof cleanup !== 'function' && typeof cleanup.unsubscribe !== 'function') {
      throw TypeError();
    }

    let clean: (() => void) | undefined = () => {
      clean = undefined;
      if (typeof cleanup === 'function') {
        cleanup();
      } else if (cleanup?.unsubscribe) {
        methodOf(cleanup, 'unsubscribe')?.()
      }
    };

    if (closed) {
      clean?.()
    }

    return subscription;

    function next_(value: T, ...args: any[]): any {
      if (closed) return undefined;
      next = next ?? methodOf(obj, 'next');
      return notify(() => next?.(value, ...args));
    }

    function error_(e: any): any {
      if (closed) throw e;

      try {
        closed = true;
        error = error ?? methodOf(obj, 'error');
        if (!error) throw e;
        return notify(() => error?.(e));
      } finally {
        clean?.();
      }
    }

    function complete_(x?: any): any {
      if (closed) return undefined;

      try {
        closed = true;
        complete = complete ?? methodOf(obj, 'complete');
        return notify(() => complete?.(x));
      } finally {
        clean?.();
      }
    }

    function notify(action: () => any): any {
      try {
        return action();
      } catch (err) {
        closed = true;
        try {
          clean?.();
        } catch (ignored) {
          throw err;
        }
      }
    }
  }
}

Object.defineProperty(Observable.prototype, Symbol.observable, {
  enumerable: false
});

Object.defineProperty(Observable.prototype, 'subscribe', {
  enumerable: false
});

Object.defineProperty(Observable, 'of', {
  enumerable: false
});

Object.defineProperty(Observable, 'from', {
  enumerable: false
});
