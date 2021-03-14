export function methodOf<T, K extends keyof T>(obj: T, key: K): T[K] | undefined {
  const value = obj?.[key];
  if (value == null) {
    return undefined;
  }

  if (typeof value !== 'function') {
    throw TypeError(`${key} is not a function`);
  }

  return value.bind(obj);
}

export function rethrows(x: unknown): void {
  throw x;
}

export function ifCallable<T>(obj: T, def: T): T {
  return typeof obj === 'function' ? obj : def;
}

export function isOf(obj: {constructor: unknown}, constructor: new (...args: any[]) => any): boolean {
  return obj?.constructor === constructor || obj instanceof constructor;
}
