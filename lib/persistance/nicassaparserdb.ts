import { SequelizeConnect } from './sequelizeconnect';

import { Schema } from './schema/schema';
import { Filter } from './filter';

export interface NicassaParserDB {
    formatVersion: string;
    lastUpdateUTC: string;
    sequelizeConnect?: SequelizeConnect;
    schema?: Schema;
    filter?: Filter;
    forceViewColumnsNotNull?: boolean;
}
