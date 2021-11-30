// Copyright 2020 Datafuse Labs.

import { FC, useEffect, useState, ReactElement, useRef } from "react";
import { Select, Input, Space, Tree, Row, Col, message, Button } from "antd";
import { chain, filter, cloneDeep } from "lodash";
import { DownOutlined } from "@ant-design/icons";
import SpinLoading from "@/components/Loading/SpinLoading";
import styles from "./css_navigator.module.scss";
import RefreshSvg from "@/assets/svg/refresh";
import DatabaseSvg from "@/assets/svg/database";
import { getSqlStatement } from "@/apis/sql";
import { IFields, ITableColumn, ITableInfo } from "@/types/sql";
import { useMousePosition } from "@/hooks/useMousePosition";
import CopySvg from "@/assets/svg/copy";
import { copyToClipboard } from "@/utils/tools";

const { Option } = Select;
interface Iprops {
  getTreeData: (e: Array<any>) => void;
}
const GET_ALL_DATABASE = `SELECT * FROM system.databases;`;
let backUpData: any[] = [];
const Navigator: FC<Iprops> = ({ getTreeData }): ReactElement => {
  const mousePosition = useMousePosition();
  const [database, setDatabase] = useState<Array<string>>([]);
  const [treeData, setTreeData] = useState<ITableInfo[]>([]);
  const [showLine, setShowLine] = useState<boolean | { showLeafIcon: boolean }>(false);
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
        const { columns, data, error } = response;
        if (error) {
          message.warning(error);
          return;
        }
        const { fields } = columns;
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
          let e = tempDatabase[0];
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
      let style = coppyRef.current["style"] as any;
      style.left = mousePosition.x + 50 + "px";
      style.top = mousePosition.y - 30 + "px";
      style.display = "block";
      let timeId = setTimeout(() => {
        style.display = "none";
        clearTimeout(timeId);
      }, 200);
    }
    let node = e.node;
    let { title, name } = node;
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
    let groupedItems = chain(dataList)
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
    let dataList: Array<ITableColumn> = [];
    data.map(item => {
      let tempObj: any = {};
      item.map((value, index) => {
        let key = keys[index];
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
    <>
      <div ref={coppyRef} className={styles.coppy}>
        <span>
          <CopySvg></CopySvg>
          <span> Copied</span>
        </span>
      </div>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Row>
          <Col span={3}>
            <DatabaseSvg></DatabaseSvg>
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
      <div className={styles.treeArea}>
        <SpinLoading tip="Loading..." spinning={loadDatabase}>
          <Row className={styles.searchInput}>
            <Col span={20}>
              <Input onChange={onSearch} placeholder="Search table / fields" />
            </Col>
            <Col span={3}>
              <Button onClick={onRefresh} className={styles.refreshBtn} type="primary" icon={<RefreshSvg />}></Button>
            </Col>
          </Row>
          <Tree onSelect={onTreeSelect} onExpand={onExpand} expandedKeys={expandedKeys} height={1000} showLine={showLine} switcherIcon={<DownOutlined />} treeData={treeData} />
        </SpinLoading>
      </div>
    </>
  );
};

export default Navigator;
