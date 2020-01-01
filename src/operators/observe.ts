import {Observable} from "../observable";
import {ObservableLike, Observer, Operator, Subscription} from "../interfaces";
import {from} from "./from";

export function observe<T>(): Operator<ObservableLike<T>, T> {
  return function observe(obj: ObservableLike<ObservableLike<T>>): Observable<T> {
    return new Observable<T>(({complete, error, next}) => {
      let closed = false;
      const subs = new Set<Subscription>();
      const main = from(obj)
        .subscribe(Object.freeze<Observer<ObservableLike<T>>>({
          next(value) {
            const sub = from(value)
              .subscribe({
                next,
                error,
                complete() {
                  subs.delete(sub);
                  complete_();
                },
              });

            subs.add(sub);
          },
          error,
          complete() {
            closed = true;
            complete_();
          },
        }));

      return () => {
        main.unsubscribe();
        subs.forEach(sub => sub.unsubscribe());
        closed = true;
      };

      function complete_() {
        if (closed && subs.size === 0) {
          complete();
        }
      }
    });
  };
}
