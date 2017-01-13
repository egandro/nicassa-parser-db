import { Table } from './table';
import { View } from './view';

export class Schema {
    dialect: string;
    tables: Table[];
    views: View[];
}
