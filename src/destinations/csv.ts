import fs from 'fs';
import readline from 'readline';
import { EPEventSource } from '../EPEventSource';

class CSV implements EPEventSource {
  constructor(private doc: any) { }

  readEvents = async function* () {
    const readInterface = readline.createInterface({
      input: fs.createReadStream(this.doc.source.file)
    });
    let headers;
    for await (const line of readInterface) {
      const row = line.split(',');
      if (!headers) {
        headers = row
        continue;
      }
      yield Object.fromEntries(headers
        .map((header, index) => {
          if (row[index]) {
            return [header.trim(), row[index].trim()]
          }
        })
        .filter(x => x));
    }
  }

}

export default CSV;