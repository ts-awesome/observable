const {filter, of} = require('../dist/index');

test('filter operator', async () => {
  const ob = of(1, 2, 3);
  const op = filter(x => x > 1);
  const r = [];

  await op(ob).forEach(x => r.push(x));

  expect(r).toStrictEqual([2,3]);
})
