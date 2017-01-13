import { Sequelize } from 'sequelize';

import { ColumnSymbol } from './symboltable/columnsymbol';
import { TableSymbol } from './symboltable/tablesymbol';
import { ViewSymbol } from './symboltable/viewsymbol';
import { PrimaryKeySymbol } from './symboltable/primarykeysymbol';
import { ReferenceSymbol } from './symboltable/referencesymbol';

import { BaseDriver } from './basedriver'

export class MSSQLDriver implements BaseDriver {
    sequelize: Sequelize;
    database: string;

    constructor(sequelize: any) {
        this.sequelize = sequelize;
        this.database = (<any>this.sequelize).config.database; // this kills your sweet kitty!
    }

    public async readColumns(): Promise<ColumnSymbol[]> {
        let result = await this.getColumns();
        return await result;
    }

    public async readTables(): Promise<TableSymbol[]> {
        let data = await this.getViewOrTableList(false);
        let result: ViewSymbol[] = [];

        for (let i = 0; i < data.length; i++) {
            let item: ViewSymbol = {
                name: data[i]
            }
            result.push(item);
        }

        return await result;
    }

    public async readViews(): Promise<ViewSymbol[]> {
        let data = await this.getViewOrTableList(true);
        let result: ViewSymbol[] = [];

        for (let i = 0; i < data.length; i++) {
            let item: ViewSymbol = {
                name: data[i]
            }
            result.push(item);
        }

        return await result;
    }

    public async readPrimaryKeys(): Promise<PrimaryKeySymbol[]> {
        let result = await this.getPrimaryKeys();
        return await result;
    }

    public async readReferences(): Promise<ReferenceSymbol[]> {
        let result = await this.getReferences();
        return await result;
    }

    protected async getViewOrTableList(isView: boolean): Promise<string[]> {
        let tableType = "base table";

        if (isView) {
            tableType = "view";
        }

        let sql =
            "select table_name " +
            "from information_schema.tables " +
            "where table_type = '" + tableType + "' and table_catalog= '" + this.database + "' " +
            "order by table_name ";

        let data = await this.sequelize.query(sql);
        let result: string[] = [];
        let arr = (<any>data)[0];

        for (let i = 0; i < arr.length; i++) {
            result.push(arr[i].table_name);
        }

        return await result;
    }

    protected async getColumns(): Promise<ColumnSymbol[]> {
        let sql =
            "select table_name, column_name, data_type, is_nullable, " +
            "column_default, character_maximum_length, numeric_precision, " +
            "datetime_precision, ordinal_position " +
            "from information_schema.columns " +
            "where table_catalog = '" + this.database + "' " +
            "order by table_name, ordinal_position";

        let data = await this.sequelize.query(sql);
        let result: ColumnSymbol[] = [];
        let arr = (<any>data)[0];

        for (let i = 0; i < arr.length; i++) {
            let item: ColumnSymbol = {
                name: arr[i].column_name,
                tableName: arr[i].table_name,
                dataType: arr[i].data_type,
                nullable: arr[i].is_nullable === 'YES',
                defaultValue: arr[i].column_default,
                length: arr[i].character_maximum_length,
                numericPrecision: arr[i].numeric_precision,
                datetimePrecision: arr[i].datetime_precision
            }
            result.push(item);
        }

        return await result;
    }

    protected async getPrimaryKeys(): Promise<PrimaryKeySymbol[]> {
        let sql =
            "select object_name(ic.object_id) as table_name, " +
            "col_name(ic.object_id,ic.column_id) as column_name " +
            "from sys.indexes as i inner join " +
            "sys.index_columns as ic on  i.object_id = ic.object_id " +
            "and i.index_id = ic.index_id " +
            "where i.is_primary_key = 1 " +
            "order by table_name, column_name";

        let data = await this.sequelize.query(sql);
        let result: PrimaryKeySymbol[] = [];
        let arr = (<any>data)[0];

        for (let i = 0; i < arr.length; i++) {
            let item: PrimaryKeySymbol = {
                tableName: arr[i].table_name,
                columnName: arr[i].column_name,
            }
            result.push(item);
        }

        return await result;
    }

    protected async getReferences(): Promise<ReferenceSymbol[]> {
        let sql =
            /*obj.name as [fk_name], " +
            "sch.name as [schema_name]*/
            "select  " +
            "tab1.name as table_name, " +
            "col1.name as column_name, " +
            "tab2.name as referenced_table, " +
            "col2.name as referenced_column " +
            "from sys.foreign_key_columns fkc " +
            "inner join sys.objects obj " +
            "on obj.object_id = fkc.constraint_object_id " +
            "inner join sys.tables tab1 " +
            "on tab1.object_id = fkc.parent_object_id " +
            "inner join sys.schemas sch " +
            "on tab1.schema_id = sch.schema_id " +
            "inner join sys.columns col1 " +
            "on col1.column_id = parent_column_id and col1.object_id = tab1.object_id " +
            "inner join sys.tables tab2 " +
            "on tab2.object_id = fkc.referenced_object_id " +
            "inner join sys.columns col2 " +
            "on col2.column_id = referenced_column_id and col2.object_id = tab2.object_id";

        let data = await <any>this.sequelize.query(sql);
        let result: ReferenceSymbol[] = [];
        let arr = (<any>data)[0];

        for (let i = 0; i < arr.length; i++) {
            let item: ReferenceSymbol = {
                tableName: arr[i].table_name,
                columnName: arr[i].column_name,
                referencedTableName: arr[i].referenced_table,
                referencedColumnName: arr[i].referenced_column,
            }
            result.push(item);
        }

        return await result;
    }

}
