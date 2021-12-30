// Copyright 2020 Datafuse Labs.
import { FC, ReactElement, useState } from "react";
import clsx from "clsx";
import IconFont from "@/assets/scss/icon";
import Navigator from "./navigator";
import SqlQuery from "./query";
import styles from "./css_index.module.scss";

const SqlIde: FC = (): ReactElement => {
  const [tableTips, setTableTips] = useState<any>([]);
  const [isLargeNavigator, setIsLargeNavigator] = useState(false);
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
  const scaleNavigator = () => {
    setIsLargeNavigator(!isLargeNavigator);
  };
  return (
    <div className={styles.main}>
      <div className={clsx(styles.navigator, isLargeNavigator && styles.navigatorW1)}>
        <Navigator style={{ display: isLargeNavigator ? "none" : "block" }} getTreeData={getTreeData} />
        <IconFont onClick={scaleNavigator} className={clsx(styles.databendShousuo, isLargeNavigator && styles.databendShousuoRight)} type="databend-shousuo"></IconFont>
      </div>
      <div className={styles.content}>
        <SqlQuery tableCodeTips={tableTips} />
      </div>
    </div>
  );
};

export default SqlIde;
