const {map, of} = require('../dist/index');

test('map operator', async () => {
  const ob = of(1, 2, 3);
  const op = map(x => x * x);
  const r = [];

  await op(ob).forEach(x => r.push(x));

  expect(r).toStrictEqual([1,4,9]);
})
