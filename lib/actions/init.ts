let fs = require('fs');
let process = require('process');

import { Filter } from '../persistance/filter';
import { NicassaParserDB } from '../persistance/nicassaparserdb';
import { SequelizeConnect } from '../persistance/sequelizeconnect';
import { TopLevel } from '../persistance/toplevel';

export class Init {
    fileName: string;

    run(opts: any) {
        this.fileName = opts.file;

        if (fs.existsSync(this.fileName)) {
            if (this.sectionExistInFile()) {
                console.error('error: section already exist in "' + this.fileName + '"');
                process.exit(-1);
            }
        }

        let data = this.createJsonString();

        try {
            fs.writeFileSync(this.fileName, data);
        } catch (err) {
            console.error('error: can\'t create file "' + this.fileName + '"');
            // console.error(err);
            process.exit(-1);
        }
    }

    protected sectionExistInFile(): boolean {
        let str = null;

        try {
            str = fs.readFileSync(this.fileName);
        } catch (err) {
            console.error('error: can\'t read file "' + this.fileName + '"');
            // console.error(err);
            process.exit(-1);
        }

        let toplevel: TopLevel = JSON.parse(str);
        return (toplevel.nicassaParserDB !== undefined);
    }

    protected createJsonString(): string {
        let str = null;

        try {
            if (fs.existsSync(this.fileName)) {
                str = fs.readFileSync(this.fileName);
            }
        } catch (err) {
            console.error('error: can\'t read file "' + this.fileName + '"');
            // console.error(err);
            process.exit(-1);
        }

        if (str === null) {
            let toplevel: TopLevel = {
                nicassaParserDB: <any>null
            }
            str = JSON.stringify(toplevel, null, 2);
        }

        let connect: SequelizeConnect = {
            database: 'database',
            username: 'username',
            password: 'password',
            options: {
                host: 'localhost',
                dialect: "'mysql'|'mariadb'|'sqlite'|'postgres'|'mssql'",
                pool: {
                    max: 5,
                    min: 0,
                    idle: 10000
                },
                storage: 'path/to/database.sqlite'
            },
            connectionUri: 'postgres://user:pass@example.com:5432/dbname'
        };

        let filter: Filter = {
            excludeTables: false,
            excludeViews: false,
            exculdeColumns: [],
            exculde: [],
            only: []
        }

        let nicassaParserDB: NicassaParserDB = {
            formatVersion: '1.0',
            lastUpdateUTC: (new Date()).toUTCString(),
            sequelizeConnect: connect,
            filter: filter
        }

        let toplevel: TopLevel = JSON.parse(str);
        toplevel.nicassaParserDB = nicassaParserDB;

        let result = JSON.stringify(toplevel, null, 2);
        return result;
    }
}

export default function run(opts: any) {
    let instance = new Init();
    return instance.run(opts);
}
