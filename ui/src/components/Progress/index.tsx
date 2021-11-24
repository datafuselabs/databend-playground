import { FC, ReactElement } from "react";
import Loading from "@/components/Loading";
import styles from "./styles.module.scss";
import { Button } from "antd";
interface Iprops {
  className: string;
  executeText: string;
  cancel: () => void;
}
const Progress: FC<Iprops> = ({ className, executeText, cancel }): ReactElement => {
  return (
    <div className={`${styles.progressBoard} ${className}`}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: "30px" }}>
        <Loading></Loading>
        <div className={styles.text}>{executeText}</div>
      </div>
      <Button onClick={cancel}>Cancel</Button>
    </div>
  );
};
export default Progress;
