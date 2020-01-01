import {Observer, OnComplete, OnError, OnNext, Subscribable, Subscription, SubscriptionObserver} from "./interfaces";
import {methodOf, rethrows} from "./utils";


export class Subject<T> implements Subscribable<T>, Observer<T> {

  protected closed = false;
  protected subscribers = new Set<SubscriptionObserver<T>>();

  constructor(protected value?: T) {
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

    const closed = () => this.closed;

    const observer: SubscriptionObserver<T> = {
      get closed() { return closed(); },
      next: next_,
      error: error_,
      complete: complete_,
    };

    const subscription = Object.freeze<Subscription>({
      get closed() { return closed() },
      unsubscribe: () => {
        this.subscribers.delete(observer);
      }
    });

    this.subscribers.add(observer);
    obj.start?.(subscription);

    if (!this.subscribers.has(observer)) {
      return subscription;
    }

    if (this.value !== void 0) {
      observer.next(this.value);
    }

    let next: OnNext<T> | undefined = undefined;
    return subscription;

    function next_(value: T, ...args: any[]): any {
      next = next ?? methodOf(obj, 'next');
      return notify(() => next?.(value, ...args));
    }

    function error_(e: any): any {
      const error = methodOf(obj, 'error') ?? rethrows;
      return notify(() => error?.(e));
    }

    function complete_(x?: any): any {
      const complete = methodOf(obj, 'complete');
      return notify(() => complete?.(x));
    }

    function notify(action: () => any): any {
      try {
        return action();
      } catch (e) {
        setTimeout(() => rethrows(e));
      }
    }
  }

  next(value: T) {
    if (this.closed) return;
    if (this.value !== void 0) {
      this.value = value;
    }
    this.subscribers.forEach(sub => sub.next(value));
  }

  error(error: any) {
    if (this.closed) return;
    this.closed = true;
    this.subscribers.forEach(sub => sub.error(error));
  }

  complete() {
    if (this.closed) return;
    this.closed = true;
    this.subscribers.forEach(sub => sub.complete());
  }
}
