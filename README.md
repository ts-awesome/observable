# @ts-awesome/observable

Basic observable and operators

Implementation compatible with TC39 [proposal](https://github.com/tc39/proposal-observable)

## Base use

```ts
import {Observable, filter, map} from "@ts-awesome/observable";

function listen(element, eventName) {
  return new Observable(observer => {
    // Create an event handler which sends data to the sink
    let handler = event => observer.next(event);

    // Attach the event handler
    element.addEventListener(eventName, handler, true);

    // Return a cleanup function which will cancel the event stream
    return () => {
      // Detach the event handler from the element
      element.removeEventListener(eventName, handler, true);
    };
  });
}

// Return an observable of special key down commands
function commandKeys(element) {
  let keyCommands = { "38": "up", "40": "down" };

  return listen(element, "keydown").pipe(
    filter(event => event.keyCode in keyCommands),
    map(event => keyCommands[event.keyCode])
  )
}

let subscription = commandKeys(inputElement).subscribe({
  next(val) { console.log("Received key command: " + val) },
  error(err) { console.log("Received an error: " + err) },
  complete() { console.log("Stream complete") },
});
```

## Operators

* combine
* concat
* filter
* flatten
* from
* fromAsyncIterable
* fromPromise
* fulfill
* map
* merge
* observe
* of
* pipe
* race
* reduce

## Subject

Is a special observable with shared state.

# License
May be freely distributed under the [MIT license](https://opensource.org/licenses/MIT).

Copyright (c) 2022 Volodymyr Iatsyshyn and other contributors
