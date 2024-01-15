import fs from 'fs';
import readline from 'readline';
import { EPEventSource } from '../EPEventSource';

class CSV implements EPEventSource {
    constructor(private doc: any) {}

    readEvents = async function* () {
        const delimiter = this.doc.source.delimiter ?? ',';
        const readInterface = readline.createInterface({
            input: fs.createReadStream(this.doc.source.file),
        });

        let headers;
        for await (const line of readInterface) {
            const row = parseCSVLine(line, delimiter);
            if (!headers) {
                headers = row;
                continue;
            }

            yield Object.fromEntries(
                headers
                    .map((header, index) => {
                        if (row[index]) {
                            return [header.trim(), row[index].trim()];
                        }
                    })
                    .filter(x => x),
            );
        }
    };
}

export default CSV;

// Helper function to parse a CSV line with support for quoted values
function parseCSVLine(line: string, delimiter: string): string[] {
    const result = [];
    let insideQuotes = false;
    let currentValue = '';

    for (const char of line) {
        if (char === '"') {
            insideQuotes = !insideQuotes;
        } else if (char === delimiter && !insideQuotes) {
            result.push(currentValue);
            currentValue = '';
        } else {
            currentValue += char;
        }
    }

    // Add the last value
    result.push(currentValue);

    return result;
}
