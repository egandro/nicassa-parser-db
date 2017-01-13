import { Sequelize } from 'sequelize';

import { ColumnSymbol } from './symboltable/columnsymbol';
import { TableSymbol } from './symboltable/tablesymbol';
import { ViewSymbol } from './symboltable/viewsymbol';
import { PrimaryKeySymbol } from './symboltable/primarykeysymbol';
import { ReferenceSymbol } from './symboltable/referencesymbol';

import { BaseDriver } from './basedriver'

export class PostgresDriver implements BaseDriver {
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
        let tableType = "BASE TABLE";

        if (isView) {
            tableType = "VIEW";
        }

        let sql =
            "select table_name " +
            "from information_schema.tables " +
            "where table_type = '" + tableType + "' and table_catalog= '" + this.database + "' " +
            "order by table_name ";

        let data = await <any>this.sequelize.query(sql);
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

        let data = await <any>this.sequelize.query(sql);
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
            "select t.table_name, k.column_name " +
            "from information_schema.table_constraints t  " +
            "left join information_schema.key_column_usage k  " +
            "using(constraint_name,table_schema,table_name)  " +
            "where t.constraint_type='PRIMARY KEY'  " +
            "and t.table_catalog='" + this.database + "'" +
            "order by table_name, column_name";

        let data = await <any>this.sequelize.query(sql);
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
            "select " +
            "tc.table_name, kcu.column_name, " +
            "ccu.table_name as referenced_table, " +
            "ccu.column_name as referenced_column " +
            "from " +
            "information_schema.table_constraints as tc " +
            "join information_schema.key_column_usage as kcu " +
            "on tc.constraint_name = kcu.constraint_name " +
            "join information_schema.constraint_column_usage as ccu " +
            "on ccu.constraint_name = tc.constraint_name " +
            "where " +
            "constraint_type = 'FOREIGN KEY' and " +
            "kcu.constraint_catalog = '" + this.database + "' ";

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
