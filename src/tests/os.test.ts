import test from 'ava';

import { handler } from '../destinations/os';

test('🍏 handler', async (t) => {
    const result = await handler('search', 'event');
    t.assert(result.body.hits.hits[0]._source.name, 'Not Harry Potter');
});
