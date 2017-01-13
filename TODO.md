## add support for defining queries

- Sequerlize somehow supports defining queries
- We need a model parser for RAW sql

```JavaScript
var ProjectDetails = sequelize.define('project', {
  title: Sequelize.STRING,
  coders: Sqeuerlize.NUMBER
})

ver complexQuery = 'SELECT p.title, SUM(foo.bar) as coders FROM projects as p ...inner join ... WHERE status = :status';
sequelize.query(complexQuery,
    { model: Projects, status: 'active' }).then(function(projects){
    // Each record will now be a instance of Project
})
```

- this becomes handy in some places
- it works like a view
- you can create a model via simple sql (e.g. for DTOs, Reports, ..)
- you can use this for more complex query e.g. "SELECT p.title, q.coders FROM (" + complexQuery + ") as p ...";


## Add a optional version identifier

- add a version property to the JSON file
- add a query that the update can use to update the version

```JSON
{
  "version": "1.0",
  "versionQuery": "SELECT DatabaseVersion as version FROM MyCoolVersionTable",
  "versionAutoUpdate": true
}
```

## Sqlite 3 enhancements

- SQlite is not a "real" database
- there are issues with the type detection, e.g. you can have a VARCHAR(30) in the model but the parser gives you a TEXT (which is OK in terms of the database capabilities)
- If you want the VARCHAR and the 30 we have to parse the SQL for the model definition do to better
- this becomes ugly :( we might need a 2nd field for the Type and the Shadow Type OR a global mode for the parser on how to treat sqlite

## Sqlite 3 file esoterics

- in the nicassa.json file Sqlite 3 file paths can be absolute e.g. "/foo/bar", relative "./bar/stuff" or windows-ish "C:/projects/a.json"
- however we might call the file from a different directory, and relative to the process Sequelize won't find the SQLite file
- todo: detect the issue when it occures, do some magic


