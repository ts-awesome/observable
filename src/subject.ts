import {
  Observer,
  OnComplete,
  OnError,
  OnNext,
  Subscribable,
  Subscription,
  SubscriptionObserver
} from "./interfaces";
import {methodOf, rethrows} from "./utils";


export class Subject<T> implements Subscribable<T>, Observer<T> {

  protected closed = false;
  protected subscribers = new Set<SubscriptionObserver<T>>();

  private readonly behave: boolean;
  protected value: T | undefined;

  public get last(): T | undefined {
    return this.value;
  }

  constructor(value?: T) {
    this.behave = arguments.length > 0;
    if (this.behave) {
      this.value = value;
    }

    this.subscribe = this.subscribe.bind(this);
    this.next = this.next.bind(this);
    this.error = this.error.bind(this);
    this.complete = this.complete.bind(this);
  }

  public subscribe(observer: Observer<T>): Subscription;
  public subscribe(onNext?: OnNext<T>, onError?: OnError, onComplete?: OnComplete): Subscription;
  public subscribe(obj: Observer<T> | OnNext<T> | undefined): Subscription {
    if (typeof obj === 'function' || arguments.length > 1) {
      // eslint-disable-next-line prefer-rest-params
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

    if (this.behave && this.value !== undefined) {
      observer.next(this.value);
    }

    let next: OnNext<T> | undefined = undefined;
    return subscription;

    function next_(value: T, ...args: any[]): any {
      next = next ?? methodOf(obj as Observer<T>, 'next');
      return notify(() => next?.(value, ...args));
    }

    function error_(e: any): any {
      const error = methodOf(obj as Observer<T>, 'error') ?? rethrows;
      return notify(() => error?.(e));
    }

    function complete_(x?: any): any {
      const complete = methodOf(obj as Observer<T>, 'complete');
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

  next(value: T): void {
    if (this.closed) return;
    if (this.behave) {
      this.value = value;
    }
    this.subscribers.forEach(sub => sub.next(value));
  }

  error(error: unknown): void {
    if (this.closed) return;
    this.closed = true;
    this.subscribers.forEach(sub => sub.error(error));
  }

  complete(): void {
    if (this.closed) return;
    this.closed = true;
    this.subscribers.forEach(sub => sub.complete());
  }
}
