import { Sequelize } from 'sequelize';

import { TableSymbol } from './symboltable/tablesymbol';
import { ViewSymbol } from './symboltable/viewsymbol';
import { ColumnSymbol } from './symboltable/columnsymbol';
import { PrimaryKeySymbol } from './symboltable/primarykeysymbol';
import { ReferenceSymbol } from './symboltable/referencesymbol';

export interface BaseDriver {
    sequelize: Sequelize;
    readTables(): Promise<TableSymbol[]>;
    readViews(): Promise<ViewSymbol[]>;
    readColumns(): Promise<ColumnSymbol[]>;
    readPrimaryKeys(): Promise<PrimaryKeySymbol[]>;
    readReferences(): Promise<ReferenceSymbol[]>;
}
