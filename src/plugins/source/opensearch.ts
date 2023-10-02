import { openSearchReadPages } from './../../destinations/openSearch';

export async function processOpensearch(doc: any, processEvent: Function) {
    let count = 0;
    let isFirstEvent = true;
    for await (const item of openSearchReadPages(doc)) {
        await processEvent(doc, item._source, isFirstEvent);
        isFirstEvent = false;
        count++;
    }
    console.info(`${count} records processed`);
}