const {of} = require('../dist/index');

test('of operator', async () => {
  const ob = of(1, 2, 3);
  const r = [];

  await ob.forEach(x => r.push(x));

  expect(r).toStrictEqual([1,2,3]);
})
