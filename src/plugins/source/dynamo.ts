import { Dynamo } from './../../destinations/dynamodb';

export async function processDynamoDb(doc: any, processEvent: Function)  {
    
    const ddb = new Dynamo();

    let lastEvaluatedKey;
    let isFirstEvent = true;
    do {
        const unmarshaledEvents = await ddb.scanTable(
            doc.source.table,
            lastEvaluatedKey,
        );
        if (unmarshaledEvents?.Items) {
            const events = unmarshaledEvents.Items.map(item =>
                ddb.unmarshall(item),
            );
            for (const event of events) {
                await processEvent(doc, event, isFirstEvent);
            }            
        }
        lastEvaluatedKey = unmarshaledEvents.LastEvaluatedKey;
        isFirstEvent = false;
    } while (lastEvaluatedKey);
}