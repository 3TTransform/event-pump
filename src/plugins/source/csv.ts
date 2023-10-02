import { EPEventSource } from './../../EPEventSource';
import CSV from './../../destinations/csv';

export async function processCSV(doc: any, processEvent: Function) 
{
    let isFirstEvent = true;
    const source: EPEventSource = new CSV(doc);
    for await (const event of source.readEvents()) {
        await processEvent(doc, await event, isFirstEvent);
        isFirstEvent = false;
    }
}