// Copyright 2020 Datafuse Labs.
import Navigator from "./navigator";
import SqlQuery from "./query";

import styles from "./css_index.module.scss";
import { FC, ReactElement, useState } from "react";
const SqlIde: FC = (): ReactElement => {
  const [tableTips, setTableTips] = useState<any>([]);
  const getTreeData = (data: any): void => {
    const obj: any = {};
    data.map((item: any) => {
      obj[item.table] = [];
    });
    if (data && data.length > 0) {
      obj[data[0].database] = [];
    }
    setTableTips(obj);
  };
  return (
    <div className={styles.main}>
      <div className={styles.navigator}>
        <Navigator getTreeData={getTreeData} />
      </div>
      <div className={styles.content}>
        <SqlQuery tableCodeTips={tableTips} />
      </div>
    </div>
  );
};

export default SqlIde;
