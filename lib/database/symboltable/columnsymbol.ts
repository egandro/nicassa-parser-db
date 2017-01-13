export interface ColumnSymbol {
    name: string;
    tableName: string;
    dataType: string;
    nullable: boolean;
    defaultValue: string;
    length: number;
    numericPrecision: string;
    datetimePrecision: string;
}
