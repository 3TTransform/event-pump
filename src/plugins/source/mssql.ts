import { EPEventSource } from './../../EPEventSource';
import MSSQLHandler from './../../handlers/MSSQLHandler';

export async function processMSSQL(doc: any, processEvent: Function, delay: number = 100) {
    let isFirstEvent = true;
    const source: EPEventSource = new MSSQLHandler(doc);

    // Helper function to create a delay
    const delayAsync = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    for await (const event of source.readEvents()) {
        await processEvent(doc, await event, isFirstEvent);
        //console.log('event', event);
        isFirstEvent = false;
        await delayAsync(delay);  // Add delay here
    }
}