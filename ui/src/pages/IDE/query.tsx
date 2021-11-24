// Copyright 2021 Datafuse Labs.

import { FC, ReactElement, useState } from "react";
import { Button } from "antd";
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
import SorrySvg from "@/assets/svg/sorry";
import ResultSvg from "@/assets/svg/result";
import QuerySvg from "@/assets/svg/query";
import NoDataFragment from "@/components/NoData";
import VirtualTable from "@/components/VitualTable";
import Progress from "@/components/Progress";
import { getSqlNextStatement, getSqlQuery, getSqlStatus } from "@/apis/sql";
import { IColumn, IStatementResponse } from "@/types/sql";
import { filterSize } from "@/utils/math";
import { killConnected } from "./utils";
interface ITableData {
  number?: string | number | any;
  database: string;
  extra_info: string;
  host: string;
  id: string | number;
  memory_usage: number;
  state: string;
  type: string;
}
interface IQueryError {
  code: string | number;
  message: string;
  backtrace: any[] | string;
}

/**
 * deal colums data
 * @param data
 * @returns
 */
function processColumns(data: IStatementResponse) {
  return data.columns.fields.map(function (field, idx) {
    return {
      title: field.name,
      key: field.name,
      dataIndex: idx,
    };
  });
}
const SqlQuery: FC = (): ReactElement => {
  const RUNNING = "Running...";
  const [cancelUrl, setCancelUrl] = useState(""); // cache final_uri
  const [statement, setStatement] = useState<string>("");
  const [tableData, setTableData] = useState<Array<ITableData>>([]);
  const [time, setTime] = useState<number>(0);
  const [readRows, setReadRows] = useState<number>(0);
  const [readBytes, setReadBytes] = useState<number>(0);
  const [tableColumns, setTableColumns] = useState<IColumn[]>([{ title: "Execute SQL please" }]);
  const [executeDisabled, setExecuteDisabled] = useState(false);
  const [executeText, setExecuteText] = useState(RUNNING);
  const [isInit, setIsInit] = useState(true); // Whether it is the first time to enter the program
  const [showError, setShowError] = useState(false);
  const [sqlError, setSqlError] = useState<IQueryError | any>({});

  /**
   * show error board kanban
   */
  function showErrorBoard(error: IQueryError | any) {
    setShowError(true);
    setSqlError(error);
  }
  /**
   * update UI
   * @param state
   */
  function updateProgressUi(state: string) {
    setExecuteText(state);
  }
  /**
   * get sql stats
   * @param stats_uri
   * @param final_uri
   */
  function updateProgress(stats_uri: string, final_uri: string) {
    let timerId = setInterval(async () => {
      getSqlStatus(stats_uri)
        .then(({ state, error }) => {
          updateProgressUi(state);
          if (!state || state !== "Running" || error) {
            clearInterval(timerId);
            killConnected(final_uri);
            if (error) {
              showErrorBoard(error);
            }
          }
        })
        .catch(error => {
          clearInterval(timerId);
          killConnected(final_uri);
          console.info(error);
        });
    }, 1000);
  }

  /***
   * execute sql
   */
  const executeSql = async () => {
    setExecuteDisabled(true);
    setExecuteText(RUNNING);
    setTableData([]);
    setIsInit(false);
    setShowError(false);
    let rows: any = [];
    let read_bytes_total: number = 0;
    let read_rows_total: number = 0;
    const response: IStatementResponse = await getSqlQuery({
      sql: statement,
    });
    let { final_uri, data, next_uri, error, stats_uri, stats } = response;
    setCancelUrl(final_uri);
    stats_uri && updateProgress(stats_uri, final_uri);
    read_bytes_total = (stats.progress && stats.progress.read_bytes) || 0;
    read_rows_total = (stats.progress && stats.progress.read_rows) || 0;
    if (error) {
      setExecuteDisabled(false);
      console.info("error info:", error);
      showErrorBoard(error);
      return;
    } else {
      rows = data;
      const columns: IColumn[] = processColumns(response);
      setTableColumns(columns);
    }
    try {
      while (next_uri && rows.length < 100000) {
        const nextResponse = await getSqlNextStatement(next_uri);
        const { data, error, stats } = nextResponse;

        if (error) {
          showErrorBoard(error);
          break;
        }

        next_uri = nextResponse.next_uri;

        read_bytes_total += (stats.progress && stats.progress.read_bytes) || 0;
        read_rows_total += (stats.progress && stats.progress.read_rows) || 0;
        rows = [...rows, ...data];
      }
      setTableData(rows);
      setReadRows(read_rows_total);
      setReadBytes(read_bytes_total);
      setExecuteDisabled(false);
    } catch (error) {
      setExecuteDisabled(false);
      console.info("error info:", error);
    }
  };
  /**
   * cancel execute sql
   */
  const cancel = () => {
    killConnected(cancelUrl);
    setExecuteDisabled(false);
    updateProgressUi("Cancelled");
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
            <Button disabled={executeDisabled} type="primary" onClick={executeSql} className={styles.execButton}>
              <ExecuteSvg />
              Execute
            </Button>
          </div>
          <div className={styles.sqlCodeMirror}>
            <CodeMirror
              placeholder="Example: SELECT * FROM system.tables;"
              value={statement}
              height="220px"
              extensions={[sql({ dialect: MySQL })]}
              onChange={value => {
                setStatement(value);
              }}
            />
          </div>
        </div>
        <div className={styles.tableArea}>
          <div className={styles.tableTips}>
            <div className={styles.indicators}>
              <TableSvg></TableSvg>
              <span>Rows: {readRows}</span>
            </div>
            <div className={styles.indicators}>
              <TimeSvg></TimeSvg>
              <span>Time:{time < 100 ? time + "ms" : time / 1000 + "s"}</span>
            </div>
            <div className={styles.indicators}>
              <StorageSvg></StorageSvg>
              <span>{filterSize(readBytes)}</span>
            </div>
            {/* <div className={styles.scaleBtn}>
              <Button className={styles.queryBtn} shape="round" type="primary">
                <QuerySvg />
                Query
              </Button>
              <Button className={styles.resultBtn} shape="round" type="primary">
                <ResultSvg />
                Results
              </Button>
            </div> */}
          </div>
          {showError && (
            <div className={styles.errorBoard}>
              <SorrySvg></SorrySvg>
              {sqlError && (
                <p className={styles.tips}>
                  {sqlError?.code}: {sqlError?.message}
                </p>
              )}
            </div>
          )}
          {executeDisabled && <Progress cancel={cancel} executeText={executeText} className={styles.progress}></Progress>}
          {tableData.length > 0 ? <VirtualTable dataSource={tableData} columns={tableColumns} scroll={{ y: 400, x: true }} /> : <NoDataFragment />}
        </div>
      </div>
    </>
  );
};

export default SqlQuery;
