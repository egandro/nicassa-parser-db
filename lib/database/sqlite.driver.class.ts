import { Sequelize } from 'sequelize';

import { ColumnSymbol } from './symboltable/columnsymbol';
import { TableSymbol } from './symboltable/tablesymbol';
import { ViewSymbol } from './symboltable/viewsymbol';
import { PrimaryKeySymbol } from './symboltable/primarykeysymbol';
import { ReferenceSymbol } from './symboltable/referencesymbol';

import { BaseDriver } from './basedriver'

export class SQLiteDriver implements BaseDriver {
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
        let tableType = "table";

        if (isView) {
            tableType = "view";
        }

        let sql =
            "select name " +
            "from sqlite_master " +
            "where type = '" + tableType + "' " +
            "AND name != 'sqlite_sequence' " +
            "order by name ";

        let data = await <any>this.sequelize.query(sql);
        let result: string[] = [];
        let arr = (<any>data);

        for (let i = 0; i < arr.length; i++) {
            result.push(arr[i]);
        }

        return await result;
    }

    protected async getColumns(): Promise<ColumnSymbol[]> {
        let result: ColumnSymbol[] = [];
        let tables = await this.getTables("'view', 'table'");

        for (let k = 0; k < tables.length; k++) {
            let table = tables[k];
            let sql = "PRAGMA table_info('" + table + "')";
            let data = await <any>this.sequelize.query(sql);
            let arr = (<any>data)[0];

            for (let i = 0; i < arr.length; i++) {
                let item: ColumnSymbol = {
                    name: arr[i].name,
                    tableName: table,
                    dataType: arr[i].type || 'TEXT',
                    nullable: arr[i].notnull === 0,
                    defaultValue: arr[i].dflt_value,
                    length: <any>null,
                    numericPrecision: <any>null,
                    datetimePrecision: <any>null
                }
                result.push(item);
            }
        }

        return await result;
    }

    protected async getPrimaryKeys(): Promise<PrimaryKeySymbol[]> {
        let result: PrimaryKeySymbol[] = [];
        let tables = await this.getTables("'view', 'table'");

        for (let k = 0; k < tables.length; k++) {
            let table = tables[k];
            let sql = "PRAGMA table_info('" + table + "')";
            let data = await <any>this.sequelize.query(sql);
            let arr = (<any>data)[0];

            for (let i = 0; i < arr.length; i++) {
                if (arr[i].pk != 1) {
                    continue;
                }
                let item: PrimaryKeySymbol = {
                    tableName: table,
                    columnName: arr[i].name,
                }
                result.push(item);
            }
        }

        return await result;
    }

    protected async getReferences(): Promise<ReferenceSymbol[]> {
        let result: ReferenceSymbol[] = [];
        let tables = await this.getTables("'table'");

        for (let k = 0; k < tables.length; k++) {
            let table = tables[k];
            let sql = "PRAGMA foreign_key_list('" + table + "')";
            let data = await <any>this.sequelize.query(sql);
            let arr = (<any>data);

            for (let i = 0; i < arr.length; i++) {
                let item: ReferenceSymbol = {
                    tableName: table,
                    columnName: arr[i].from,
                    referencedTableName: arr[i].table,
                    referencedColumnName: arr[i].to,
                }
                result.push(item);
            }
        }

        return await result;
    }

    protected async getTables(type: string): Promise<string[]> {
        let sql: string =
            "select name from sqlite_master where type IN (" + type + ") AND name != 'sqlite_sequence'";

        let data = await <any>this.sequelize.query(sql);
        let result: string[] = [];
        let arr = (<any>data);

        for (let i = 0; i < arr.length; i++) {
            result.push(arr[i]);
        }

        return await result;
    }

}
