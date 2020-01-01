const {of, map, filter, reduce, flatten} = require('../dist/index');

test('pipe operator', async () => {
  const ob = of(1, 2, 3)
    .pipe(
      filter(x => x > 1),
      map(x => [x, x * 2, x * 3]),
      flatten(),
      reduce((acc, x) => [...(acc || []), x])
    );
  const r = [];

  await ob.forEach(x => r.push(x));

  expect(r).toStrictEqual([[2,4,6,3,6,9]]);
})
