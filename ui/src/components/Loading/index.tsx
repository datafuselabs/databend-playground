import { FC, ReactElement } from "react";
import styles from "./styles.module.scss";
const Loading: FC = (): ReactElement => {
  return (
    <div className={styles.loading}>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
    </div>
  );
};
export default Loading;
