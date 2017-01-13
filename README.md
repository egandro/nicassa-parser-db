# Nicassa DB Parser

nicassa-parser-db is a CLI toolkit for reading Database Schema for MS-SQL, MySQL, PostgreSQL and SQLite 3.
It's intended to be used with nicassa-generator for source code generation.

## Installation

`$ sudo npm install -g nicassa-parser-db`

Please note nicassa-parser-db is written in TypeScript.

## Features

- Support for MS-SQL, MySQL, PostgreSQL and SQLite 3
- Creates a JSON Configuration file containing the Database Schema definition
- Optional storage of the connection string (highly Sequelize compatible)
- Updates the Schema (e.g. after a Database migration) and keeps the rest of the file

## Usage

```bash
# create a new schema file
$ nicassa-parser-db init -f schema.json
```

```bash
# optional step: edit the schema and add a connection string
$ vi schema.json
```

- example for sqlite
- check the Sequelize Documentation for more informations

```JSON
{
  "formatVersion": "1.0",
  "sequelizeConnect": {
    "options": {
      "dialect": "sqlite",
      "storage": "schema.db"
    }
  }
}
```

```bash
# create sqlite3 demo database
$ sqlite3 schema.db
```

```SQL
CREATE TABLE Roles (
	RoleID	INTEGER PRIMARY KEY AUTOINCREMENT,
	RoleName	TEXT NOT NULL
);

CREATE TABLE Users (
	UserID	INTEGER PRIMARY KEY AUTOINCREMENT,
	RoleID	INTEGER NOT NULL,
	UserName	TEXT NOT NULL,

	FOREIGN KEY (RoleID) REFERENCES Roles(RoleID)
);
```


```bash
# update the schema (if you added the connection string)
$ nicassa-db-parser update -f schema.json
```

```bash
# update the schema (connection string as parameter, e.g. MS-SQL, MySQL, PostgreSQL)
$ nicassa-db-parser update -f schema.json -u 'postgres://user:pass@example.com:5432/dbname'
```

## Filters

```JSON
{
    "filter": {
      "excludeTables": false,
      "excludeViews": false,
      "exculdeColumns": [],
      "exculde": [],
      "only": []
    }
}
```

- excludeTables (boolean): enables / disables the use of tables
- excludeViews (boolean): enables / disables the use of views
- exculdeColumns (string[]): array with names for excluding columns in tables and views. You can also specify "table.column" to ignore only a specific column in a view or table.
- exculde (string[]): array with names for excluding tables / views
- only (string[]): ignores the exclude section, takes only views/tables with the given name, honors excludeColumns

## Example output

```JSON
{
  "nicassaParserDB": {
    "formatVersion": "1.0",
    "lastUpdateUTC": "Mon, 02 Jan 2017 23:43:48 GMT",
    "sequelizeConnect": {
      "options": {
        "dialect": "sqlite",
        "storage": "./test.db",
        "benchmark": true,
        "logging": false
      }
    },
    "filter": {
      "excludeTables": false,
      "excludeViews": false,
      "exculdeColumns": [],
      "exculde": [],
      "only": []
    },
    "schema": {
      "dialect": "sqlite",
      "tables": [
        {
          "name": "Roles",
          "columns": [
            {
              "name": "RoleID",
              "dataType": "INTEGER",
              "nullable": true,
              "defaultValue": null,
              "length": null,
              "precision": null,
              "pk": true,
              "referencedTableName": null,
              "referencedColumnName": null
            },
            {
              "name": "RoleName",
              "dataType": "TEXT",
              "nullable": false,
              "defaultValue": null,
              "length": null,
              "precision": null,
              "pk": false,
              "referencedTableName": null,
              "referencedColumnName": null
            }
          ]
        },
        {
          "name": "Users",
          "columns": [
            {
              "name": "UserID",
              "dataType": "INTEGER",
              "nullable": true,
              "defaultValue": null,
              "length": null,
              "precision": null,
              "pk": true,
              "referencedTableName": null,
              "referencedColumnName": null
            },
            {
              "name": "RoleID",
              "dataType": "INTEGER",
              "nullable": false,
              "defaultValue": null,
              "length": null,
              "precision": null,
              "pk": false,
              "referencedTableName": "Roles",
              "referencedColumnName": "RoleID"
            },
            {
              "name": "UserName",
              "dataType": "TEXT",
              "nullable": false,
              "defaultValue": null,
              "length": null,
              "precision": null,
              "pk": false,
              "referencedTableName": null,
              "referencedColumnName": null
            }
          ]
        }
      ],
      "views": []
    }
  }
}
```

## Resources

- [SQLite3 Example](https://github.com/egandro/nicassa-db-parser/blob/master/examples/sqlite3/README.md)
- [Sequelize Documentation](http://docs.sequelizejs.com/en/latest/)
