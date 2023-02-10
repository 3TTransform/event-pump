import test from "ava";

import { getProp, marshall, populateEventData } from "./utils";

test("getProp", async (t) => {
  const deepObj = {
    a: 1,
    b: {
      c: 2,
      d: {
        e: 3,
        f: {
          g: 4,
        },
      },
    },
  };

  const cases = [
    {
      obj: { cake: { name: "chocolate", price: 10 } },
      path: "cake.name",
      expected: "chocolate",
    },
    {
      obj: { cake: { name: "chocolate", price: 10 } },
      path: "cake.price",
      expected: 10,
    },
    { obj: { cake: { lie: true } }, path: "cake.lies", expected: undefined },
    { obj: deepObj, path: "b.d.f.g", expected: 4 },
  ];

  cases.forEach((test) => {
    t.true(test.expected === getProp(test.obj, test.path));
  });
});

test("marshall", async (t) => {
  let result = marshall({ cake: { name: "chocolate", price: 10 } });
  t.is(
    JSON.stringify(result),
    JSON.stringify({
      cake: {
        M: {
          name: {
            S: "chocolate",
          },
          price: {
            N: "10",
          },
        },
      },
    })
  );
});

test("populateEventData", async (t) => {
  let result = populateEventData(
    { cake: { name: "{{cakeType}}", price: "{{cakePrice}}" } },
    {
      cakeType: "Cheese",
      cakePrice: 50,
    }
  );
  t.is(
    JSON.stringify(result),
    JSON.stringify({ cakeType: { S: "Cheese" }, cakePrice: { N: "50" } })
  );
});
