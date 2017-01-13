export class Column {
    name: string;
    dataType: string;
    nullable: boolean;
    defaultValue: string;
    length: number;
    precision: string;
    pk: boolean;
    referencedTableName: string;
    referencedColumnName: string;
}
