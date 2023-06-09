const Handlebars = require('handlebars');

Handlebars.registerHelper('removeLastChar', function (options: any) {
    const result = options.fn(this);
    return result.replace(/,\s*$/, ' ');
});

Handlebars.registerHelper('commadelimlist', function (options: any) {
    let result = options.fn(this);
    while (result.match(/,\s*,/)) {
        result = result.replaceAll(/,\s*,/, ',');
    }
    return result.replace(/,\s*$/, ' ').replace(/^\s*,/, ' ');
});

function replaceValues(data: any, source: any) {
    const template = Handlebars.compile(source);
    return template(data);
}
export { replaceValues };
