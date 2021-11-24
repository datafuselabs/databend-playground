export interface IStatementResponse {
  id: string;
  nextUri: string;
  final_uri: string;
  next_uri: string;
  state: string;
  data: Array<Array<any>>;
  columns: {
    fields: Array<{
      name: string;
      data_type: string;
      nullable: boolean;
    }>;
  };
  error: string,
  stats: {
    progress: {
      read_bytes: number;
      read_rows: number;
      total_rows_to_read: number;
    }
  };
  stats_uri: string;
}

export interface IColumn {
  title?: string;
  key?: string;
  dataIndex?: string | number;
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