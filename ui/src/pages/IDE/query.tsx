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

function processColumns(data: IStatementResponse) {
  return data.columns.fields.map(function (field, idx) {
    return {
      title: field.name,
      key: field.name,
      dataIndex: idx,
    };
  });
}
function SqlQuery() {
  const [statement, setStatement] = useState<string>("SELECT * FROM system.processes;");
  const [tableData, setTableData] = useState([]);
  const [time, setTime] = useState(0);
  const [readRows, setReadRows] = useState(0);
  const [readBytes, setReadBytes] = useState(0);
  const [tableColumns, setTableColumns] = useState<IColumn<number>[]>([]);
  const executeSql = async () => {
    const beginTime = +new Date();
    const response: IStatementResponse = await getSqlStatement(statement);
    const error: string = response.error;
    if (error) {
      message.error(error);
      setTableData([]);
      setReadRows(0);
      setReadBytes(0);
      setTime(0);
      return;
    }
    const timeEed = +new Date() - beginTime;
    setTime(timeEed - 3);
    const data: any = response.data;
    const columns: IColumn<number>[] = processColumns(response);
    setTableColumns(columns);
    setTableData(data);
    const { read_rows, read_bytes } = response.stats;
    setReadRows(read_rows);
    setReadBytes(read_bytes);
  };

  return (
    <>
      <div className={styles.sqlIde}>
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
          <Table pagination={false} dataSource={tableData} columns={tableColumns} />
        </div>
      </div>
    </>
  );
}

export default SqlQuery;
