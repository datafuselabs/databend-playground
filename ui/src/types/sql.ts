export interface IStatementResponse {
  id: string;
  nextUri: string;
  data: Array<Array<any>>;
  columns: {
    fields: Array<{
      name: string;
      data_type: string;
      nullable: boolean;
    }>;
  };
  error: string,
  stats: any;
}

export interface IColumn<T> {
  title: string;
  key: string;
  dataIndex: T;
}
export interface ITableColumn {
  data_type: string;
  database: string;
  is_nullable: boolean;
  key: string;
  name: string;
  table: string;
  title: string;
}
export interface ITableInfo {
  title: string;
  key: string;
  children: Array<ITableColumn>;
}
export interface IFields {
  data_type: string;
  name: string;
  nullable: boolean;
}