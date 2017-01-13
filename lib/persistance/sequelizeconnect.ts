/**
 * example
 *
 * database: 'database'
 * username: 'username'
 * password: 'password',
 * options: {
    host: 'localhost',
    dialect: 'mysql'|'mariadb'|'sqlite'|'postgres'|'mssql',

    pool: {
        max: 5,
        min: 0,
        idle: 10000
    },

    // SQLite only
    storage: 'path/to/database.sqlite'
    }

    // Or you can simply use a connection uri
    var sequelize = new Sequelize('postgres://user:pass@example.com:5432/dbname');
 */
export interface SequelizeConnect {
    database?: string;
    username?: string;
    password?: string;
    options?: any;
    connectionUri?: string;
}
