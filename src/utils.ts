export function methodOf<T, K extends keyof T>(obj: T, key: K): T[K] | undefined {
  const value = obj?.[key];
  if (value == null) {
    return undefined;
  }

  if (typeof value !== 'function') {
    throw TypeError(`${key} is not a function`);
  }

  return value
}

export function rethrows(x: any): void {
  throw x;
}

export function ifCallable<T>(obj: any, def: T): T {
  return typeof obj === 'function' ? obj : def;
}

export function cancellation<T>() : {
  cancel: () => void,
  token: symbol,
  promise: Promise<T>,
} {
  let cancel: any = undefined;
  const token = Symbol() as any;
  const promise = new Promise<T>(reject => { cancel = () => reject(token) });

  return {
    cancel,
    token,
    promise,
  }
}

export function isOf(obj: any, constructor: Function): boolean {
  return obj?.constructor === constructor || obj instanceof constructor;
}
