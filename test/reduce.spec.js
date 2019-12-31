const {reduce, of} = require('../dist/index');

test('reduce operator', async () => {
  const ob = of(1, 2, 3);
  const op = reduce((acc, x) => !acc ? `${x}` : `${acc}${x}`);
  const r = [];

  await op(ob).forEach(x => r.push(x));

  expect(r).toStrictEqual(['123']);
})
