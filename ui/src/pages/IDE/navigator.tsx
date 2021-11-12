// Copyright 2020 Datafuse Labs.

import { useEffect, useState } from "react";
import { Select, Input, Space, Tree, Row, Col, message } from "antd";
import { DownOutlined } from "@ant-design/icons";
import styles from "./css_navigator.module.scss";
import DatabaseSvg from "@/assets/svg/database";
import { getSqlStatement } from "@/apis/sql";
const { Option } = Select;
const { Search } = Input;
import * as _ from "lodash";
import { IFields, ITableColumn, ITableInfo } from "@/types/sql";

const GET_ALL_DATABASE = `SELECT * FROM system.databases;`;
function processFields(fields: IFields[]): Array<string> {
  return fields.map((item: IFields) => {
    return item.name;
  });
}
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
  let groupedItems = _(dataList)
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
function Navigator() {
  const [database, setDatabase] = useState<Array<string>>([]);
  const [treeData, setTreeData] = useState<ITableInfo[]>([]);
  const [showLine, setShowLine] = useState<boolean | { showLeafIcon: boolean }>(false);
  const [selectDefaultDatabase, setSelectDefaultDatabase] = useState<string>("");
  const handleDbChange = (value: string): void => {
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
      });
  };
  const onSearchTableOrFields = (value: string): void => {
    console.log(value);
  };
  useEffect(() => {
    getSqlStatement(GET_ALL_DATABASE).then(response => {
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
    });
  }, []);
  return (
    <>
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
        <Search placeholder="Search table / fields" onSearch={onSearchTableOrFields} enterButton />
      </Space>
      <div className={styles.treeArea}>
        <Tree showLine={showLine} switcherIcon={<DownOutlined />} treeData={treeData} />
      </div>
    </>
  );
}

export default Navigator;
