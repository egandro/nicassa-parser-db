let fs = require('fs');
let process = require('process');

import sequelize = require('sequelize');
let Sequelize: sequelize.SequelizeStatic = require('sequelize');

import { TopLevel } from '../persistance/toplevel';
import { NicassaParserDB } from '../persistance/nicassaparserdb';
import { SequelizeConnect } from '../persistance/sequelizeconnect';

export class ConnectTest {
    public async run(opts: any): Promise<boolean> {
        let fileName: string = opts.file;

        if (!fs.existsSync(fileName)) {
            console.error('error: file "' + fileName + '" does not exists');
            process.exit(-1);
        }

        let str = null;

        try {
            str = fs.readFileSync(fileName);
        } catch (err) {
            console.error('error: can\'t read file "' + fileName + '"');
            // console.error(err);
            process.exit(-1);
        }

        let toplevel: TopLevel = JSON.parse(str);
        let ndb: NicassaParserDB = <any>toplevel.nicassaParserDB;

        if (ndb.sequelizeConnect === null) {
            console.log('error: can\'t connect - "sequelizeConnect" not defined');
            process.exit(-1);
        }

        let con: SequelizeConnect = <SequelizeConnect>ndb.sequelizeConnect;
        try {
            await this.testConnection(con);
            console.log('connection successfull');
            process.exit();
        } catch (err) {
            console.log('error: connection failed');
            console.log(err);
        };
        return await true;
    }

    protected async testConnection(con: SequelizeConnect): Promise<void> {
        let sequelize: sequelize.Sequelize;
        if (con.connectionUri != null) {
            sequelize = new Sequelize(con.connectionUri);
        } else {
            sequelize = new Sequelize(<any>con.database, <any>con.username, <any>con.password, con.options);
        }
        return await <any>sequelize.authenticate();
    }

}

export default async function run(opts: any) {
    let instance = new ConnectTest();
    return await instance.run(opts);
}
