import Handlebars from 'handlebars';
import crypto from 'crypto';

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

// Register a custom Handlebars helper for SHA-256 hashing
Handlebars.registerHelper('sha256', function (value) {
    // Check if the value is provided
    if (typeof value === 'string') {
        // Create a SHA-256 hash
        const sha256Hash = crypto
            .createHash('sha256')
            .update(value)
            .digest('hex');
        return sha256Hash;
    } else {
        return ''; // Return an empty string if the value is not provided or invalid
    }
});

// Register a custom Handlebars helper for uuidv4 creation
Handlebars.registerHelper('randomUUID', function () {
    return crypto.randomUUID();
});

function replaceValues(data: any, source: any) {
    const template = Handlebars.compile(source);
    return template(data);
}
export { replaceValues };
