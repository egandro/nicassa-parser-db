# Sqilte 3 example

```bash
# create a new schema file
$ sequelize-db-json init -f northwind.json

# create a new sqlite database
$ sqlite3 test.db <../../test/sql/Northwind.Sqlite3.sql

# modify the connect string
$ vi northwind.json
```

```JSON
    "sequelizeConnect": {
      "options": {
        "dialect": "sqlite",
        "storage": "./test.db",
        "benchmark": true,
        "logging": false
      }
    },
```

```bash
# update the model
$ sequelize-db-json update -f northwind.json
```

modify your database

```bash
# update the model again
$ sequelize-db-json update -f northwind.json
```
