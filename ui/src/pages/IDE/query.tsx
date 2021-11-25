// Copyright 2021 Datafuse Labs.

import { FC, ReactElement, useState, useEffect } from "react";
import { Button } from "antd";
import { Controlled as CodeMirror } from "react-codemirror2";
import "codemirror/lib/codemirror.css";
import "codemirror/addon/fold/foldgutter.js";
import "codemirror/addon/fold/foldcode.js";
import "codemirror/addon/fold/brace-fold.js";
import "codemirror/addon/fold/comment-fold.js";
import "codemirror/mode/sql/sql";
import "codemirror/addon/hint/show-hint.css";
import "codemirror/addon/hint/show-hint.js";
import "codemirror/addon/lint/lint.js";
import "codemirror/addon/hint/sql-hint.js";
import "codemirror/addon/hint/anyword-hint.js";
import "codemirror/addon/edit/closebrackets.js";
import "codemirror/addon/edit/matchbrackets.js";
import "codemirror/addon/fold/foldgutter.js";
import "codemirror/addon/fold/foldgutter.css";
import "codemirror/addon/selection/active-line";

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
import { showInfo } from "@/utils/tools";
import { killConnected } from "./utils";

let winTableCodeTips = {}; // global table tips;
interface IProps {
  tableCodeTips: any;
}
// console.log(cm.hint);
interface IQueryError {
  code: string | number;
  message: string;
  backtrace: any[] | string;
}

const SqlQuery: FC<IProps> = ({ tableCodeTips }): ReactElement => {
  winTableCodeTips = tableCodeTips;
  const TARGET_NUMBER = 10000;
  const RUNNING = "Running...";
  let timerId: any = 0;
  const [cancelUrl, setCancelUrl] = useState(""); // cache final_uri
  const [statement, setStatement] = useState<string>("SELECT * FROM system.tables;");
  const [tableData, setTableData] = useState<Array<any>>([]);
  const [time, setTime] = useState<number>(0);
  const [readRows, setReadRows] = useState<number>(0);
  const [readBytes, setReadBytes] = useState<number>(0);
  const [tableColumns, setTableColumns] = useState<IColumn[]>([{ title: "Execute SQL please" }]);
  const [executeDisabled, setExecuteDisabled] = useState(false);
  const [executeText, setExecuteText] = useState(RUNNING);
  const [showError, setShowError] = useState(false);
  const [sqlError, setSqlError] = useState<IQueryError | any>({});

  useEffect(() => {
    return () => {
      clearInterval(timerId);
    }; // called when Component unexplained destruction/destroyed
  }, []);
  /**
   * deal colums data
   * @param data
   * @returns
   */
  function processColumns(data: IStatementResponse) {
    let len = data.columns.fields.length;
    return data.columns.fields.map(function (field, idx) {
      return {
        title: field.name,
        key: field.name,
        dataIndex: idx,
        width: len < 8 ? null : 170,
      };
    });
  }
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
    timerId = setInterval(() => {
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
          showInfo(error);
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
      showInfo(error);
      showErrorBoard(error);
      return;
    } else {
      rows = data;
      const columns: IColumn[] = processColumns(response);
      setTableColumns(columns);
    }
    try {
      while (next_uri && rows.length < TARGET_NUMBER) {
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
      showInfo(error);
    }
  };
  /**
   * cancel execute sql
   */
  const cancel = () => {
    killConnected(cancelUrl);
    setExecuteDisabled(false);
    updateProgressUi("Cancelled");
    clearInterval(timerId);
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
              value={statement}
              options={{
                mode: "sql",
                matchBrackets: true,
                styleActiveLine: true,
                autoCloseBrackets: true,
                lint: true,
                extraKeys: { Tab: "autocomplete" },
                hintOptions: { completeSingle: false },
                gutters: ["CodeMirror-lint-markers"],
                lineNumbers: true,
              }}
              onBeforeChange={(editor, data, value) => {
                setStatement(value);
              }}
              onInputRead={editor => {
                const hintOptions = {
                  tables: winTableCodeTips,
                  completeSingle: false,
                };
                editor.setOption("hintOptions", hintOptions);
                editor.showHint();
              }}
              onSelection={(editor, data) => {
                let value = editor.getSelection();
                console.log(value);
                // const n = editor.getRange({ line: data.head.line, ch: data.head.ch });
                // console.log(n);
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
          <div className={styles.virtualTable}>{tableData.length > 0 ? <VirtualTable dataSource={tableData} columns={tableColumns} scroll={{ y: 400, x: true }} /> : <NoDataFragment />}</div>
        </div>
      </div>
    </>
  );
};

export default SqlQuery;
