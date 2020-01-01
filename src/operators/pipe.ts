import {ObservableLike, Operator} from "../interfaces";
import {from} from "./from";

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
