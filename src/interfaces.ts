import {Observable} from "./observable";

export interface SubscriberFunction<T> {
  (observer: SubscriptionObserver<T>) : void|(() => void)|Subscription;
}

export interface OnNext<T> {
  (value: T, ...extra: any): any;
}

export interface OnError {
  (error: any): any;
}

export interface OnComplete {
  (extra?: any): any;
}

export interface Subscription {
  readonly closed: boolean;
  unsubscribe(): void;
}

export interface Observer<T> {
  start?(subscription: Subscription): void;
  next?(value: T): void;
  error?(error: any): void;
  complete?(msg?: any): void;
}

export interface SubscriptionObserver<T> {
  readonly closed: boolean;

  next(value: T): void;
  error(error: any): void;
  complete(): void;
}

export interface ObservableProvider<T> {
  [Symbol.observable](): Observable<T>;
}

export interface Subscribable<T> {
  subscribe(observer: Observer<T>): Subscription;
  subscribe(onNext?: OnNext<T>, onError?: OnError, onComplete?: OnComplete): Subscription;
}

export type ObservableLike<T> = Observable<T> | ObservableProvider<T> | Subscribable<T>;

export interface Operator<T, U> {
  (value: ObservableLike<T>): Observable<U>;
}
