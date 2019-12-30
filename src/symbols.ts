export const ObservableSymbol = Symbol.for('Observable');

Object.defineProperty(Symbol, 'observable', {
  value: ObservableSymbol,
  writable: false,
});

declare global {
  interface SymbolConstructor {
    readonly observable: symbol;
  }
}
