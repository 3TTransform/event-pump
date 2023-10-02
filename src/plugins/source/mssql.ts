import { EPEventSource } from './../../EPEventSource';
import MSSQLHandler from './../../handlers/MSSQLHandler';

export async function processMSSQL(doc: any, processEvent: Function) 
{
    let isFirstEvent = true;
    const source: EPEventSource = new MSSQLHandler(doc);
    for await (const event of source.readEvents()) {
        await processEvent(doc, await event, isFirstEvent);
        isFirstEvent = false;
    }
}