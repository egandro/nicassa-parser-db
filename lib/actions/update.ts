let fs = require('fs');
let process = require('process');
const shajs = require('sha.js');

import sequelize = require('sequelize');
let Sequelize: sequelize.SequelizeStatic = require('sequelize');

import { Filter } from '../persistance/filter';
import { TopLevel } from '../persistance/toplevel';
import { NicassaParserDB } from '../persistance/nicassaparserdb';
import { SequelizeConnect } from '../persistance/sequelizeconnect';
import { Schema } from '../persistance/schema/schema';

import { SchemaReader } from '../database/schemareader.class';

export class UpdateSymbolTable {
    sequelize: sequelize.Sequelize;
    fileName: string;
    filter: Filter;

    public async run(opts: any): Promise<boolean> {
        this.fileName = opts.file;
        let uri: string = opts.uri;

        if (!fs.existsSync(this.fileName)) {
            console.error('error: file "' + this.fileName + '" does not exists');
            process.exit(-1);
        }

        let str = null;

        try {
            str = fs.readFileSync(this.fileName);
        } catch (err) {
            console.error('error: can\'t read file "' + this.fileName + '"');
            // console.error(err);
            process.exit(-1);
        }

        let toplevel: TopLevel = JSON.parse(str);

        if (toplevel.nicassaParserDB === null) {
            console.log('error: no \'nicassaParserDB\' section found in config file');
            process.exit(-1);
        }

        let nicassaParserDB: NicassaParserDB = <NicassaParserDB>toplevel.nicassaParserDB;
        this.filter = <Filter>nicassaParserDB.filter;

        // overwrite with uri
        if (uri !== undefined || uri !== null) {
            if (nicassaParserDB.sequelizeConnect === undefined || nicassaParserDB.sequelizeConnect === null) {
                nicassaParserDB.sequelizeConnect = {
                    connectionUri: ''
                }
            }
            nicassaParserDB.sequelizeConnect.connectionUri = uri;
        }

        if (nicassaParserDB.sequelizeConnect === null) {
            console.log('error: can\'t connect - "sequelizeConnect" not defined or no "uri" specified');
            process.exit(-1);
        }

        let con: SequelizeConnect = <SequelizeConnect>nicassaParserDB.sequelizeConnect;
        console.log('connecting...');
        try {
            this.sequelize = await this.testConnection(con);
            console.log('reading schema...');
            await this.readSchema();
            process.exit();
        } catch (err) {
            console.log('error: connection failed');
            console.log(err);
        };
        return await true;
    }

    protected async readSchema(): Promise<void> {
        let reader = new SchemaReader(this.sequelize, this.filter);
        try {
            let data: Schema = await reader.read();
            console.log('updating file...');
            await this.updateJsonFile(data);
            process.exit(0);
        } catch (err) {
            console.log('error: connection failed');
            console.log(err);
            process.exit(-1);
        };
    }

    protected updateJsonFile(data: Schema) {
        let str = '';
        try {
            str = fs.readFileSync(this.fileName);
        } catch (err) {
            console.error('error: can\'t read file "' + this.fileName + '"');
            process.exit(-1);
        }

        let toplevel: any = JSON.parse(str);
        toplevel.nicassaParserDB.lastUpdateUTC = ''; // nullify date

        str = JSON.stringify(toplevel, null, 2);
        let currentChecksum = this.checkSum(str);

        toplevel.nicassaParserDB.formatVersion = '1.0';
        toplevel.nicassaParserDB.schema = data;

        str = JSON.stringify(toplevel, null, 2);
        let updateChecksum = this.checkSum(str);

        if (updateChecksum === currentChecksum) {
            console.log('no changes detected...');
            return;
        }

        // set update date
        toplevel.nicassaParserDB.lastUpdateUTC = (new Date()).toUTCString();
        str = JSON.stringify(toplevel, null, 2);

        try {
            fs.writeFileSync(this.fileName, str);
        } catch (err) {
            console.error('error: can\'t update file "' + this.fileName + '"');
            process.exit(-1);
        }
    }

    protected checkSum(data: Buffer|string): string {
        return shajs('sha256').update(data).digest('hex');
    }

    protected async testConnection(con: SequelizeConnect): Promise<sequelize.Sequelize> {
        let sequelize: sequelize.Sequelize;
        if (con.connectionUri != null) {
            sequelize = new Sequelize(con.connectionUri);
        } else {
            sequelize = new Sequelize(<any>con.database, <any>con.username, <any>con.password, con.options);
        }
        await <any>sequelize.authenticate();
        return await sequelize;
    }

}

export default async function run(opts: any) {
    let instance = new UpdateSymbolTable();
    return await instance.run(opts);
}
