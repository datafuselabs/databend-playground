// Copyright 2020 Datafuse Labs.

import { useState } from "react";
import { Button, Table, message } from "antd";
import CodeMirror from "@uiw/react-codemirror";
import { sql, MySQL } from "@codemirror/lang-sql";
import "codemirror/lib/codemirror.css";
import "codemirror/mode/sql/sql";
import "codemirror/addon/hint/show-hint.css";
import "codemirror/addon/hint/show-hint.js";
import "codemirror/addon/hint/sql-hint.js";
import "codemirror/theme/ambiance.css";
import EditSvg from "@/assets/svg/edit";
import ExecuteSvg from "@/assets/svg/execute";
import TableSvg from "@/assets/svg/table";
import TimeSvg from "@/assets/svg/time";
import styles from "./css_query.module.scss";
import StorageSvg from "@/assets/svg/storage";
import { getSqlStatement } from "@/apis/sql";
import { IColumn, IStatementResponse } from "@/types/sql";
import { filterSize } from "@/utils/math";
interface ITableData {
  database: string;
  extra_info: string;
  host: string;
  id: string | number;
  memory_usage: number;
  state: string;
  type: string;
}
function processFields(fields: IColumn[]): Array<string> {
  return fields.map((item: IColumn) => {
    return item.key;
  });
}
function processColumns(data: IStatementResponse) {
  return data.columns.fields.map(function (field) {
    console.log(field);
    return {
      title: field.name,
      key: field.name,
      dataIndex: field.name,
    };
  });
}
function processTableData(keys: Array<string>, data: Array<Array<any>>): Array<ITableData> {
  let dataList: Array<any> = [];
  data.map(item => {
    let tempObj: any = {};
    item.map((value, index) => {
      let key = keys[index];
      tempObj[key] = value;
    });
    dataList.push(tempObj);
  });
  return dataList;
}
function SqlQuery() {
  const [statement, setStatement] = useState<string>("SELECT * FROM system.processes;");
  const [tableData, setTableData] = useState<Array<ITableData>>([]);
  const [time, setTime] = useState<number>(0);
  const [readRows, setReadRows] = useState<number>(0);
  const [readBytes, setReadBytes] = useState<number>(0);
  const [tableColumns, setTableColumns] = useState<IColumn[]>([]);
  const executeSql = async () => {
    const beginTime = +new Date();
    const response: IStatementResponse = await getSqlStatement(statement);
    const timeEed = +new Date() - beginTime;
    const error: string = response.error;
    if (error) {
      message.error(error);
      setTableData([]);
      setReadRows(0);
      setReadBytes(0);
      setTime(0);
      return;
    }
    setTime(timeEed - 3);
    const data: any = response.data;
    const columns: IColumn[] = processColumns(response);
    const keys: Array<string> = processFields(columns || []);
    const dealData: Array<ITableData> = processTableData(keys, data);
    setTableColumns(columns);
    setTableData(dealData);
    console.log(columns, dealData, "dealData");
    const { read_rows, read_bytes } = response.stats;
    setReadRows(read_rows);
    setReadBytes(read_bytes);
  };

  return (
    <>
      <div className={styles.sqlIde}>
        <div className={styles.topArea}>
          <div className={styles.topTitle}>
            <span className={styles.tips}>
              <EditSvg></EditSvg>
              <span>Query</span>
            </span>
            <Button type="primary" onClick={executeSql} className={styles.execButton}>
              <ExecuteSvg />
              Execute
            </Button>
          </div>
          <div className={styles.sqlCodeMirror}>
            <CodeMirror
              value={statement}
              height="220px"
              extensions={[sql({ dialect: MySQL })]}
              onChange={(value, viewUpdate) => {
                setStatement(value);
              }}
            />
          </div>
        </div>
        <div className={styles.tableArea}>
          <div className={styles.tableTips}>
            <div className={styles.indicators}>
              <TableSvg></TableSvg>
              <span>Rows: {readRows > 1000 ? "1000+" : readRows}</span>
            </div>
            <div className={styles.indicators}>
              <TimeSvg></TimeSvg>
              <span>Time:{time < 100 ? time + "ms" : time / 1000 + "s"}</span>
            </div>
            <div className={styles.indicators}>
              <StorageSvg></StorageSvg>
              <span>{filterSize(readBytes)}</span>
            </div>
          </div>
          <Table rowKey={record => `${record.id}`} pagination={false} dataSource={tableData} columns={tableColumns} />
        </div>
      </div>
    </>
  );
}

export default SqlQuery;
