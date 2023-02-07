/*
given an object like this:
{ cake: { name: "chocolate", price: 10 } }
and a string like this:
"cake.name"
return the value of the property even if it is nested
*/
const getProp = (obj: any, path: string) => {
    return path.split(".").reduce((o, i) => o[i], obj);
};

const populateEventData = (event, object, shouldmarshall = true ) => {
    let rawItem = JSON.stringify(object);
    const regex = /{{(.*?)}}/g;
    const matches = rawItem.match(regex);

    if (matches) {
        for (let match of matches) {
            const prop = match.replace(/{{|}}/g, "");
            const eventValue = getProp(event, prop);

            if (eventValue === undefined) {
                rawItem = rawItem.replace(`":${prop}":"{{${prop}}}"`, "");
                rawItem = rawItem.replace(`,,`, ",");
                rawItem = rawItem.replace(`,}`, "}");
                rawItem = rawItem.replace(`{,`, "{");
            }
            else {
                rawItem = rawItem.replace(`{{${prop}}}`, eventValue);
            }
        }
    }
    if (shouldmarshall)  return marshall(JSON.parse(rawItem));
    
    return JSON.parse(rawItem);
}

// a function to automatically marshals Javascript types onto DynamoDB AttributeValues
const marshall = (data: any) => {
    const result: any = {};
    for (const key of Object.keys(data)) {
        const value = data[key];
        if (value === undefined) {
            delete result[key];
        }
        if (value === null) {
            result[key] = { NULL: true };
        } else if (typeof value === "string") {
            result[key] = { S: value };
        } else if (typeof value === "number") {
            result[key] = { N: value.toString() };
        } else if (typeof value === "boolean") {
            result[key] = { BOOL: value };
        } else if (value instanceof Date) {
            result[key] = { S: value.toISOString() };
        } else if (Array.isArray(value)) {
            result[key] = { L: marshall(value) };
        } else if (typeof value === "object") {
            result[key] = { M: marshall(value) };
        } else {
            throw new Error(`Unsupported type: ${typeof value}`);
        }
    }
    return result;
};
export { populateEventData, marshall, getProp };
