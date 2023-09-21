import sql from 'mssql';
import { runSQL } from '../destinations/mssqltools';
import { EPEventSource } from '../EPEventSource';
import { replaceEnvVars } from '../utils';

export default class MSSQLHandler implements EPEventSource
{
    constructor(
        private doc: any,
        private poolPromise = new sql.ConnectionPool(replaceEnvVars(doc.source.connectionString))
    ) {}

    readEvents = async function* () {
        const SQL = this.doc.source.sql;
        const recordSetIndex = this.doc.source.recordSetIndex ?? 0;
        const results = await runSQL(this.poolPromise, SQL);
        yield* results.recordsets[recordSetIndex];
        this.poolPromise.close();
    };
}
