// Copyright 2020 Datafuse Labs.

import { FC, useEffect, useState, ReactElement, useRef } from "react";
import { Select, Input, Space, Tree, Row, Col, message, Button } from "antd";
import { chain, filter, cloneDeep } from "lodash";
import SpinLoading from "@/components/Loading/SpinLoading";
import styles from "./css_navigator.module.scss";
import RefreshSvg from "@/assets/svg/refresh";
import { getSqlStatement } from "@/apis/sql";
import { IFields, ITableColumn, ITableInfo } from "@/types/sql";
import { useMousePosition } from "@/hooks/useMousePosition";
import { copyToClipboard } from "@/utils/tools";
import IconFont from "@/assets/scss/icon";
import clsx from "clsx";

const { Option } = Select;
interface Iprops {
  getTreeData: (e: Array<any>) => void;
  style?: any;
}
const GET_ALL_DATABASE = "SELECT * FROM system.databases;";
let backUpData: any[] = [];
const Navigator: FC<Iprops> = ({ getTreeData, style }): ReactElement => {
  const mousePosition = useMousePosition();
  const [database, setDatabase] = useState<Array<string>>([]);
  const [treeData, setTreeData] = useState<ITableInfo[]>([]);
  const [showLine] = useState<boolean | { showLeafIcon: boolean }>(false);
  const [selectDefaultDatabase, setSelectDefaultDatabase] = useState<string>("");
  const [expandedKeys, setExpandedKeys] = useState<any[]>([]);
  const [loadDatabase, setLoadDatabase] = useState<boolean>(false);
  const coppyRef = useRef(null);
  // swich database
  const handleDbChange = (value: string): void => {
    setLoadDatabase(true);
    setSelectDefaultDatabase(value);
    getSqlStatement(`SELECT * FROM system.columns where database = '${value}';`)
      .then(response => {
        const { schema, data, error } = response;
        if (error) {
          message.warning(error);
          return;
        }
        const { fields } = schema;
        const keys: Array<string> = processFields(fields || []);
        const json: ITableInfo[] = processData(keys, data);
        setTreeData(json);
      })
      .catch(err => {
        console.log(err);
        setTreeData([]);
      })
      .finally(() => {
        setLoadDatabase(false);
      });
  };
  const getAllDatabase = (): void => {
    setLoadDatabase(true);
    getSqlStatement(GET_ALL_DATABASE)
      .then(response => {
        const { error, data } = response;
        if (error) {
          message.warning(error);
          return;
        }
        const tempValue = data || [];
        let tempDatabase: Array<string> = [];
        tempValue.map(item => {
          tempDatabase = [...tempDatabase, ...item];
        });
        if (tempDatabase.length > 0) {
          const e = tempDatabase[0];
          setDatabase(tempDatabase);
          setSelectDefaultDatabase(e);
          handleDbChange(e);
        }
        setExpandedKeys([]);
      })
      .finally(() => {
        setLoadDatabase(false);
      });
  };
  const onRefresh = (): void => {
    getAllDatabase();
  };
  const onExpand = (expandedKeys: any[]) => {
    setExpandedKeys(expandedKeys);
  };
  const onSearch = (e: any): void => {
    let { value } = e.target;
    value = value.trim();
    const result = filter(backUpData, item => {
      return item.key.includes(value);
    });
    const groupResult = groupList(result);
    setTreeData(groupResult);
    const keys = groupResult.map(item => item.title);
    setExpandedKeys(keys);
    if (!value) {
      setExpandedKeys([]);
    }
  };
  /**
   * tree click
   * @param selectedKeys
   * @param e
   */
  const onTreeSelect = (selectedKeys: any, e: any): void => {
    if (coppyRef.current) {
      const style = coppyRef.current["style"] as any;
      style.left = mousePosition.x + 50 + "px";
      style.top = mousePosition.y - 30 + "px";
      style.display = "block";
      const timeId = setTimeout(() => {
        style.display = "none";
        clearTimeout(timeId);
      }, 200);
    }
    const node = e.node;
    const { title, name } = node;
    copyToClipboard(name ? name : title);
  };
  useEffect(() => {
    getAllDatabase();
  }, []);

  // deaal columns
  function processFields(fields: IFields[]): Array<string> {
    return fields.map((item: IFields) => {
      return item.name;
    });
  }
  function groupList(dataList: Array<any>) {
    const groupedItems = chain(dataList)
      .groupBy(item => item.table)
      .map((items, table) => {
        return {
          title: table,
          key: table,
          children: items,
        };
      })
      .value();
    return groupedItems;
  }
  // deal tableData
  function processData(keys: Array<string>, data: Array<Array<string>>): ITableInfo[] {
    const dataList: Array<ITableColumn> = [];
    data.map(item => {
      const tempObj: any = {};
      item.map((value, index) => {
        const key = keys[index];
        tempObj[key] = value;
      });
      tempObj["title"] = `${item[0]}(${item[3]})`;
      tempObj["key"] = `${item[2]}-${item[0]}`;
      dataList.push(tempObj);
    });
    backUpData = cloneDeep(dataList);
    getTreeData(backUpData);
    return groupList(dataList);
  }
  return (
    <div style={style}>
      <div ref={coppyRef} className={styles.coppy}>
        <span>
          <IconFont type="databend-Copy" style={{ fontSize: "30px" }}></IconFont>
          <span>Copied</span>
        </span>
      </div>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Row>
          <Col span={3}>
            <IconFont type="databend-database1" style={{ fontSize: "34px" }}></IconFont>
          </Col>
          <Col span={20}>
            <Select value={selectDefaultDatabase} style={{ width: "100%" }} onChange={handleDbChange}>
              {database.map(item => {
                return (
                  <Option key={item} value={item}>
                    {item}
                  </Option>
                );
              })}
            </Select>
          </Col>
        </Row>
      </Space>
      <div className={clsx(styles.treeArea, "global-tree-area")}>
        <SpinLoading tip="Loading..." spinning={loadDatabase}>
          <Row className={styles.searchInput}>
            <Col span={20}>
              <Input onChange={onSearch} placeholder="Search table / fields" />
            </Col>
            <Col span={3}>
              <Button onClick={onRefresh} className={styles.refreshBtn} type="primary" icon={<RefreshSvg />}></Button>
            </Col>
          </Row>
          <Tree onSelect={onTreeSelect} onExpand={onExpand} expandedKeys={expandedKeys} height={3000} showLine={showLine} switcherIcon={<IconFont type="databend-table2" style={{ fontSize: "16px", position: "relative", top: "4px" }} />} treeData={treeData} />
        </SpinLoading>
      </div>
    </div>
  );
};

export default Navigator;
