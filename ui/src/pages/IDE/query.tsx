// Copyright 2021 Datafuse Labs.

import { FC, ReactElement, useState, useEffect } from "react";
import { Button } from "antd";
import { Controlled as CodeMirror } from "react-codemirror2";
import "codemirror/lib/codemirror.css";
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
import "codemirror/addon/display/placeholder.js";

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
  const [statement, setStatement] = useState<string>("");
  const [tableData, setTableData] = useState<Array<any>>([]);
  const [time, setTime] = useState<number>(0);
  const [readRows, setReadRows] = useState<number>(0);
  const [readBytes, setReadBytes] = useState<number>(0);
  const [tableColumns, setTableColumns] = useState<IColumn[]>([{ title: "Execute SQL please" }]);
  const [executeDisabled, setExecuteDisabled] = useState(false);
  const [executeText, setExecuteText] = useState(RUNNING);
  const [showError, setShowError] = useState(false);
  const [sqlError, setSqlError] = useState<IQueryError | any>({});
  const [selectionValue, setSelectionValue] = useState("");

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
    const len = data.columns.fields.length;
    const columns = data.columns.fields.map(function (field: { name: any }, idx: number) {
      return {
        title: field.name,
        key: field.name,
        dataIndex: idx,
        width: len < 7 ? null : 170,
      };
    });
    return [
      {
        title: "No.",
        width: 80,
        render: true,
      },
      ...columns,
    ];
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
  const updateProgress = (stats_uri: string, final_uri: string) => {
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
        .catch((error: any) => {
          clearInterval(timerId);
          killConnected(final_uri);
          showInfo(error);
        });
    }, 1000);
  };

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
    let wall_time_ms: number = 0;
    const response: IStatementResponse = await getSqlQuery({
      sql: selectionValue ? selectionValue : statement,
    });
    let { final_uri, data, next_uri, error, stats_uri, stats } = response;
    setCancelUrl(final_uri);
    stats_uri && updateProgress(stats_uri, final_uri);
    read_bytes_total = (stats.progress && stats.progress.read_bytes) || 0;
    read_rows_total = (stats.progress && stats.progress.read_rows) || 0;
    wall_time_ms = stats.wall_time_ms || 0;
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
        wall_time_ms += stats.wall_time_ms || 0;
        rows = [...rows, ...data];
      }
      // Ten thousand were artificially processed
      let len = rows.length ?? 0;
      if (len > TARGET_NUMBER) {
        len = TARGET_NUMBER;
        rows = rows.slice(0, TARGET_NUMBER);
      }
      setTableData(rows);
      setReadRows(len);
      setReadBytes(read_bytes_total);
      setTime(wall_time_ms);
      setExecuteDisabled(false);
      // The quantity is reached or nothing more，Release resources
      clearInterval(timerId);
      killConnected(final_uri);
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
                placeholder: "Example: SELECT * FROM system.tables;",
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
              onCursorActivity={editor => {
                let value = editor.getSelection();
                if (value) {
                  setSelectionValue(value);
                }
              }}
              onCursor={(editor, data): void => {
                let sql: string = "";
                const semiSymbol = ";";
                const cursorPosition = { line: data.line, ch: data.ch };
                // get the SQL statement before the current location (up to the last semicolon)
                const beforeSemicolon = editor.getRange({ line: 0, ch: 0 }, cursorPosition);
                // get the SQL statement after getting the current location (up to the next semicolon)
                const lastLine = editor.lastLine();
                const afterSemicolon = editor.getRange(cursorPosition, { line: lastLine, ch: editor.getLine(lastLine).length });
                const isEndSemicolon = beforeSemicolon.endsWith(semiSymbol);
                const before = beforeSemicolon.split(semiSymbol).slice(-1)[0];
                const after = afterSemicolon.split(semiSymbol)[0];
                if (isEndSemicolon || (before.trim() === "" && after.trim() === "")) {
                  sql = beforeSemicolon.split(semiSymbol).slice(-2)[0];
                } else {
                  sql = `${before}${after};`;
                }
                setSelectionValue(sql);
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
              <span>Time:{time < 1000 ? time + "ms" : time / 1000 + "s"}</span>
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
