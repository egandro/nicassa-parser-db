import * as parser from 'nomnom';

export class CmdLineParser {
    public static parse(): any {
        parser.command('init')
            .option('file', {
                abbr: 'f',
                metavar: 'nicassa.json',
                required: true,
                help: 'path for to a nicassa config file [required]'
            })
            .help('creates a new nicassa config file or adds a section to an existing json file');

        parser.command('connecttest')
            .option('file', {
                abbr: 'f',
                metavar: 'nicassa.json',
                required: true,
                help: 'path to a nicassa config file [required]'
            })
            .help('tries to connect to the database using a nicassa config file');

        parser.command('update')
            .option('file', {
                abbr: 'f',
                metavar: 'nicassa.json',
                required: true,
                help: 'path to a nicassa config file [required]'
            })
            .option('uri', {
                abbr: 'u',
                // metavar: 'postgres://user:pass@example.com:5432/dbname', // looks ugly in console
                help: 'use an optional connection uri (e.g. if your nicassa has no sequelizeConnect section)'
            })
            .help('updates the symbol table in a given nicassa config file');

        var opts = parser.parse();
        var action = null;

        if (opts[0] === undefined || opts[0] === '') {
            action = null;
        } else {
            action = {
                module: '../lib/actions/' + opts[0],
                opts: opts
            };
        }

        return action;
    }
}
