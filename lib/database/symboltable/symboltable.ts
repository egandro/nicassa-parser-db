import { ColumnSymbol } from './columnsymbol';
import { TableSymbol } from './tablesymbol';
import { ViewSymbol } from './viewsymbol';
import { PrimaryKeySymbol } from './primarykeysymbol';
import { ReferenceSymbol } from './referencesymbol';

// we go with an internal symbol table and create the schema later on

export interface SymbolTable {
    tables: TableSymbol[];
    views: ViewSymbol[];
    columns: ColumnSymbol[];
    primaryKeys: PrimaryKeySymbol[];
    references: ReferenceSymbol[];
}
