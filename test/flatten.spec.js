const {flatten, of} = require('../dist/index');

test('flatten operator', async () => {
  const ob = of([1], [2, 3], [4,5,6]);
  const op = flatten();
  const r = [];

  await op(ob).forEach(x => r.push(x));

  expect(r).toStrictEqual([1,2,3,4,5,6]);
})
