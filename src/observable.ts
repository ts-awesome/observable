import {
  Subscribable,
  Observer,
  OnComplete,
  OnError,
  OnNext,
  Operator,
  SubscriberFunction,
  Subscription,
  SubscriptionObserver
} from "./interfaces";
import {ObservableSymbol} from "./symbols";
import {methodOf, rethrows} from "./utils";
import {map, pipe, from, of} from "./operators";

export class Observable<T> implements Subscribable<T>{

  public static of = of;
  public static from = from;

  public [ObservableSymbol]() {
    return this;
  }

  constructor(private subscriber: SubscriberFunction<T>) {
    if (typeof subscriber !== 'function') {
      throw TypeError();
    }
  }

  public subscribe(observer: Observer<T>): Subscription;
  public subscribe(onNext?: OnNext<T>, onError?: OnError, onComplete?: OnComplete): Subscription;
  public subscribe(obj?: any): Subscription {
    if (typeof obj === 'function' || arguments.length > 1) {
      const [next, error, complete] = [].slice.call(arguments);
      obj = { next, error, complete };
    }

    if (typeof obj !== 'object') {
      throw TypeError(`Observer or onNext expected`);
    }

    let closed = false;
    const subscription = Object.freeze<Subscription>({
      get closed() { return closed },
      unsubscribe() {
        closed = true;
        clean?.();
      }
    });

    obj.start?.(subscription);

    if (closed) {
      return subscription;
    }

    let cleanup: any;
    let next: OnNext<T>;
    try {
      cleanup = this.subscriber(Object.freeze<SubscriptionObserver<T>>({
        get closed() { return closed; },
        complete: complete_,
        next: next_,
        error: error_,
      }));
    } catch (e) {
      const error = methodOf(obj, 'error') ?? rethrows;
      error?.(e);
    }

    if (cleanup != null && typeof cleanup !== 'function' && typeof cleanup.unsubscribe !== 'function') {
      throw TypeError(`Cleanup should be function or Subscription`);
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
        const error = methodOf(obj, 'error');
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
        const complete = methodOf(obj, 'complete');
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

  /* Extension */

  /* tslint:disable:max-line-length */
  public pipe(): Observable<T>;
  public pipe<A>(op1: Operator<T, A>): Observable<A>;
  public pipe<A, B>(op1: Operator<T, A>, op2: Operator<A, B>): Observable<B>;
  public pipe<A, B, C>(op1: Operator<T, A>, op2: Operator<A, B>, op3: Operator<B, C>): Observable<C>;
  public pipe<A, B, C, D>(op1: Operator<T, A>, op2: Operator<A, B>, op3: Operator<B, C>, op4: Operator<C, D>): Observable<D>;
  public pipe<A, B, C, D, E>(op1: Operator<T, A>, op2: Operator<A, B>, op3: Operator<B, C>, op4: Operator<C, D>, op5: Operator<D, E>): Observable<E>;
  public pipe<A, B, C, D, E, F>(op1: Operator<T, A>, op2: Operator<A, B>, op3: Operator<B, C>, op4: Operator<C, D>, op5: Operator<D, E>, op6: Operator<E, F>): Observable<F>;
  public pipe<A, B, C, D, E, F, G>(op1: Operator<T, A>, op2: Operator<A, B>, op3: Operator<B, C>, op4: Operator<C, D>, op5: Operator<D, E>, op6: Operator<E, F>, op7: Operator<F, G>): Observable<G>;
  public pipe<A, B, C, D, E, F, G, H>(op1: Operator<T, A>, op2: Operator<A, B>, op3: Operator<B, C>, op4: Operator<C, D>, op5: Operator<D, E>, op6: Operator<E, F>, op7: Operator<F, G>, op8: Operator<G, H>): Observable<H>;
  public pipe<A, B, C, D, E, F, G, H, I>(op1: Operator<T, A>, op2: Operator<A, B>, op3: Operator<B, C>, op4: Operator<C, D>, op5: Operator<D, E>, op6: Operator<E, F>, op7: Operator<F, G>, op8: Operator<G, H>, op9: Operator<H, I>): Observable<I>;
  public pipe<A, B, C, D, E, F, G, H, I>(op1: Operator<T, A>, op2: Operator<A, B>, op3: Operator<B, C>, op4: Operator<C, D>, op5: Operator<D, E>, op6: Operator<E, F>, op7: Operator<F, G>, op8: Operator<G, H>, op9: Operator<H, I>, ...operations: Operator<any, any>[]): Observable<unknown>;
  /* tslint:enable:max-line-length */

  public pipe(...ops: ReadonlyArray<Operator<any, any>>): Observable<any> {
    // @ts-ignore
    return pipe(...ops)(this);
  }

  public forEach(fn: (value: T) => void): Promise<void> {
    return map(fn)(this).toPromise();
  }

  public toPromise(): Promise<T | undefined> {
    return new Promise((resolve, error) => {
      let last: T | undefined;
      this.subscribe({
        next(x) { last = x },
        complete() { resolve(last) },
        error,
      });
    });
  }
}

Object.defineProperty(Observable.prototype, Symbol.observable, {enumerable: false});
Object.defineProperty(Observable.prototype, 'subscribe', {enumerable: false});
Object.defineProperty(Observable.prototype, 'pipe', {enumerable: false});
Object.defineProperty(Observable.prototype, 'forEach', {enumerable: false});
Object.defineProperty(Observable.prototype, 'toPromise', {enumerable: false});

Object.defineProperty(Observable, 'of', {enumerable: false});
Object.defineProperty(Observable, 'from', {enumerable: false});
