const Handlebars = require("handlebars");
function replaceValues(data, source) {
    const template = Handlebars.compile(source);
    return template(data);
}
export { replaceValues }
