import Handlebars from 'handlebars';
import crypto from 'crypto';
import { v5 as uuidv5 } from 'uuid';
import { Ulid } from 'id128';
import dotenv from 'dotenv';

dotenv.config();

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

// Register a custom Handlebars helper for ulid creation
Handlebars.registerHelper('randomULID', function () {
    const ulid = Ulid.generate();
    return ulid.toCanonical();
});

Handlebars.registerHelper('emailToUUID', function (value) {
    // Check if the value is provided
    if (typeof value === 'string') {
        // Create a SHA-256 hash
        const sha256Hash = crypto
            .createHash('sha256')
            .update(value)
            .digest('hex');
        const namespaceUUID = process.env.NAMESPACE_UUID;
        return uuidv5(sha256Hash, namespaceUUID);
    } else {
        return ''; // Return an empty string if the value is not provided or invalid
    }
});

Handlebars.registerHelper('emailToULID', function (value) {
    // Check if the value is provided
    if (typeof value === 'string') {
        // Create a SHA-256 hash
        const sha256Hash = crypto
            .createHash('sha256')
            .update(value)
            .digest('hex');
        const namespaceUUID = process.env.NAMESPACE_UUID;
        const uuid =  uuidv5(sha256Hash, namespaceUUID);
        const ulid = Ulid.fromRaw(uuid.replace(/-/g, ''));
        return ulid.toCanonical();
    } else {
        return ''; // Return an empty string if the value is not provided or invalid
    }
});


Handlebars.registerHelper('emailsInArrayToUUIDs', function (value, fromfield, tofield) {
    try {
        const arrayOfObjects = JSON.parse(value);
        const namespaceUUID = process.env.NAMESPACE_UUID; // a base UUID like 'fd27523d-49e2-4526-9f1e-52dddebf6e98' saved in the .env file

        arrayOfObjects.map(obj => {

            const sha256Hash = crypto
                .createHash('sha256')
                .update(obj[fromfield])
                .digest('hex');

            obj[tofield] = uuidv5(sha256Hash, namespaceUUID);
            delete obj[fromfield];
        });

        return JSON.stringify(arrayOfObjects);

    } catch {
        return ''; // Return an empty string if the value is not provided or invalid
    }
});

Handlebars.registerHelper('UUIDtoULID', function (value) {
    // Check if the value is provided
    if (typeof value === 'string') {
        const ulid = Ulid.fromRaw(value.replace(/-/g, ''));
        return ulid.toCanonical();
    } else {
        return ''; // Return an empty string if the value is not provided or invalid
    }
});

function replaceValues(data: any, source: any) {
    const template = Handlebars.compile(source);
    return template(data);
}
export { replaceValues };
