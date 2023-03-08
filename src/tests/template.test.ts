import test from "ava";

import { replaceValues } from "../template";


test("replaceValues", async (t) => {
  let result = replaceValues( {cakeType: 1,cakeExists: false},
    "cakeType: {{#removeLastChar}}{{cakeType}}, {{cakeExists}}, {{filling}} {{/removeLastChar}}");
  t.assert(result, "cakeType: 1, false");
});

test("removeLastChar exists", async (t) => {
  const Handlebars = require("handlebars");
  t.truthy(Handlebars.helpers.removeLastChar);
});

test("commadelimlist exists", async (t) => {
  const Handlebars = require("handlebars");
  t.truthy(Handlebars.helpers.commadelimlist);
});