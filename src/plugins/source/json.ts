import fs from 'fs';

export async function processJSON(
    doc: any,
    processEvent: Function
) {
    let isFirstEvent = true;
    const events = JSON.parse(fs.readFileSync(doc.source.file, 'utf8'));
    for (const element of events) {
        await processEvent(doc, element, isFirstEvent);
        isFirstEvent = false;
    }
}
