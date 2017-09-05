import { Sequelize } from 'sequelize';

import { Filter } from '../persistance/filter';
import { Schema } from '../persistance/schema/schema';
import { Table } from '../persistance/schema/table';
import { View } from '../persistance/schema/view';
import { Column } from '../persistance/schema/column';

import { SymbolTable } from './symboltable/symboltable';
import { ColumnSymbol } from './symboltable/columnsymbol';
import { TableSymbol } from './symboltable/tablesymbol';
import { ViewSymbol } from './symboltable/viewsymbol';
import { PrimaryKeySymbol } from './symboltable/primarykeysymbol';
import { ReferenceSymbol } from './symboltable/referencesymbol';

import { BaseDriver } from './basedriver';
import { MSSQLDriver } from './mssql.driver.class';
import { MySQLDriver } from './mysql.driver.class';
import { PostgresDriver } from './postgres.driver.class';
import { SQLiteDriver } from './sqlite.driver.class';


export class SchemaReader {
    driver: BaseDriver;

    constructor(private sequelize: Sequelize, private filter: Filter, private forceViewColumnsNotNull: boolean) {
        this.sequelize = sequelize;
        let dialect = this.sequelize.getDialect();

        switch (dialect) {
            case 'mssql':
                this.driver = new MSSQLDriver(this.sequelize);
                break;
            case 'mysql':
                this.driver = new MySQLDriver(this.sequelize);
                break;
            case 'postgres':
                this.driver = new PostgresDriver(this.sequelize);
                break;
            case 'sqlite':
                this.driver = new SQLiteDriver(this.sequelize);
                break;
            default:
                throw ('unsupported database dialect: ' + dialect);
        }
    }

    public async read(): Promise<Schema> {
        let columns: ColumnSymbol[] = await this.driver.readColumns();
        let tables: TableSymbol[] = await this.driver.readTables();
        let views: ViewSymbol[] = await this.driver.readViews();
        let primaryKeys: PrimaryKeySymbol[] = await this.driver.readPrimaryKeys();
        let references: ReferenceSymbol[] = await this.driver.readReferences();

        let symbolTable: SymbolTable = {
            columns: columns,
            tables: tables,
            views: views,
            primaryKeys: primaryKeys,
            references: references,
        }

        // create schema from symbolTable
        let schema = this.buildSchema(symbolTable);
        return await schema;

    }

    protected buildSchema(symbolTable: SymbolTable): Schema {
        let result: Schema = {
            dialect: this.sequelize.getDialect(),
            tables: [],
            views: []
        };

        let columnMap: any = this.createColumnMap(symbolTable);
        let pkMap: any = this.createPkMap(symbolTable);
        let refMap: any = this.createRefMap(symbolTable);

        let excludeTables: boolean = false;
        let excludeViews: boolean = false;
        let exculdeColumns = this.createExculdeColumnsFromFilter();
        let exculdes = this.createExculdesFromFilter();
        let only = this.createOnlyItemsFromFilter();

        if (this.filter !== undefined || this.filter !== null) {
            if (this.filter.excludeTables) {
                excludeTables = true;
            }
            if (this.filter.excludeViews) {
                excludeViews = true;
            }
        }

        if (symbolTable.tables !== undefined && !excludeTables) {
            for (let i = 0; i < symbolTable.tables.length; i++) {
                let t = symbolTable.tables[i];

                if (!columnMap.hasOwnProperty(t.name)) {
                    continue;
                }

                // excluded
                if (only.length == 0 && exculdes.indexOf(t.name) != -1) {
                    continue;
                }
                if (only.length > 0 && only.indexOf(t.name) == -1) {
                    continue;
                }

                let columns: ColumnSymbol[] = columnMap[t.name];
                if (columns.length < 1) {
                    continue;
                }

                let table: Table = {
                    name: t.name,
                    columns: []
                }
                result.tables.push(table);

                for (let k = 0; k < columns.length; k++) {
                    let col = columns[k];

                    // excluded
                    if (exculdeColumns.indexOf(col.name) != -1) {
                        continue;
                    }
                    if (exculdeColumns.indexOf(t.name + '.' + col.name) != -1) {
                        continue;
                    }

                    let column: Column = {
                        name: col.name,
                        dataType: col.dataType,
                        nullable: col.nullable,
                        defaultValue: col.defaultValue,
                        length: col.length,
                        precision: <any>null,
                        pk: false,
                        referencedTableName: <any>null,
                        referencedColumnName: <any>null
                    }

                    // precision
                    if (col.numericPrecision !== undefined || col.numericPrecision !== null) {
                        column.precision = col.numericPrecision;
                    } else if (col.datetimePrecision !== undefined || col.datetimePrecision !== null) {
                        column.precision = col.datetimePrecision;
                    }

                    // pk
                    if (pkMap.hasOwnProperty(table.name)) {
                        for (let m = 0; m < pkMap[table.name].length; m++) {
                            let colName = pkMap[table.name][m];
                            if (column.name === colName) {
                                column.pk = true;
                                break;
                            }
                        }
                    }

                    // ref
                    if (refMap.hasOwnProperty(table.name)) {
                        if (refMap[table.name].hasOwnProperty(column.name)) {
                            let ref: ReferenceSymbol = refMap[table.name][column.name];
                            column.referencedTableName = ref.referencedTableName;
                            column.referencedColumnName = ref.referencedColumnName;
                        }
                    }

                    table.columns.push(column);
                }

            }
        }

        if (symbolTable.views !== undefined && !excludeViews) {
            for (let i = 0; i < symbolTable.views.length; i++) {
                let v = symbolTable.views[i];

                if (!columnMap.hasOwnProperty(v.name)) {
                    continue;
                }

                // excluded
                if (only.length == 0 && exculdes.indexOf(v.name) != -1) {
                    continue;
                }
                if (only.length > 0 && only.indexOf(v.name) == -1) {
                    continue;
                }

                let columns: ColumnSymbol[] = columnMap[v.name];
                if (columns.length < 1) {
                    continue;
                }

                let view: View = {
                    name: v.name,
                    columns: []
                }
                result.views.push(view);

                for (let k = 0; k < columns.length; k++) {
                    let col = columns[k];

                    // excluded
                    if (exculdeColumns.indexOf(col.name) != -1) {
                        continue;
                    }
                    if (exculdeColumns.indexOf(v.name + '.' + col.name) != -1) {
                        continue;
                    }

                    let nullable = col.nullable;

                    // depending on the database we might
                    // don't get the underlying column value
                    // so setting them to not nullable might be a solution
                    if (this.forceViewColumnsNotNull) {
                        nullable = false;
                    }

                    let column: Column = {
                        name: col.name,
                        dataType: col.dataType,
                        nullable: nullable,
                        defaultValue: col.defaultValue,
                        length: col.length,
                        precision: <any>null,
                        pk: false,
                        referencedTableName: <any>null,
                        referencedColumnName: <any>null
                    }

                    // precision
                    if (col.numericPrecision !== undefined || col.numericPrecision !== null) {
                        column.precision = col.numericPrecision;
                    } else if (col.datetimePrecision !== undefined || col.datetimePrecision !== null) {
                        column.precision = col.datetimePrecision;
                    }

                    view.columns.push(column);
                }

            }
        }

        return result;
    }

    protected createColumnMap(symbolTable: SymbolTable): any {
        let columnMap: any = {};

        if (symbolTable.columns === undefined) {
            return columnMap;
        }

        for (let i = 0; i < symbolTable.columns.length; i++) {
            let column = symbolTable.columns[i];
            let name = column.tableName;
            if (!columnMap.hasOwnProperty(name)) {
                columnMap[name] = [];
            }
            columnMap[name].push(column);
        }

        return columnMap;
    }

    protected createPkMap(symbolTable: SymbolTable): any {
        let pkMap: any = {};
        if (symbolTable.primaryKeys === undefined) {
            return pkMap;
        }
        for (let i = 0; i < symbolTable.primaryKeys.length; i++) {
            let pk = symbolTable.primaryKeys[i];
            let name = pk.tableName;
            if (!pkMap.hasOwnProperty(name)) {
                pkMap[name] = [];
            }
            pkMap[name].push(pk.columnName);
        }
        return pkMap;
    }

    protected createRefMap(symbolTable: SymbolTable): any {
        let refMap: any = {};
        if (symbolTable.references === undefined) {
            return refMap;
        }
        for (let i = 0; i < symbolTable.references.length; i++) {
            let ref = symbolTable.references[i];
            let name = ref.tableName;
            let columnName = ref.columnName;
            if (!refMap.hasOwnProperty(name)) {
                refMap[name] = {};
            }
            refMap[name][columnName] = ref;
        }
        return refMap;
    }

    protected createExculdeColumnsFromFilter(): string[] {
        let columns: any = [];

        if (this.filter === undefined || this.filter === null || this.filter.exculdeColumns === undefined ||
            this.filter.exculdeColumns === null || this.filter.exculdeColumns.length < 0) {
            return columns;
        }
        columns = this.filter.exculdeColumns;
        return columns;
    }

    protected createExculdesFromFilter(): string[] {
        let excludes: any = [];

        if (this.filter === undefined || this.filter === null || this.filter.exculde === undefined ||
            this.filter.exculde === null || this.filter.exculde.length < 0) {
            return excludes;
        }

        excludes = this.filter.exculde;
        return excludes;
    }

    protected createOnlyItemsFromFilter(): string[] {
        let onlyItems: any = [];

        if (this.filter === undefined || this.filter === null || this.filter.only === undefined ||
            this.filter.only === null || this.filter.only.length < 0) {
            return onlyItems;
        }

        onlyItems = this.filter.only;
        return onlyItems;
    }

}
