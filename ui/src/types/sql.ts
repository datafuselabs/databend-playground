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