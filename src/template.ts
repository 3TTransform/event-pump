const Handlebars = require("handlebars");

Handlebars.registerHelper("removeLastChar", function(options) {
  let result = options.fn(this);
  return result.replace(/,\s*$/, " ");
}); // try this

Handlebars.registerHelper("commadelimlist", (options) => {
  console.log(options);
  let result = options.fn(this);
  while (result.match(/,\s*,/)) {
    result = result.replaceAll(/,\s*,/, ',');
  }
  return result.replace(/,\s*$/, ' ').replace(/^\s*,/, ' ');
});

function replaceValues(data, source) {
  const template = Handlebars.compile(source);
  return template(data);
}
export { replaceValues }
