// Copyright 2020 Datafuse Labs.
import Navigator from "./navigator";
import SqlQuery from "./query";

import styles from "./css_index.module.scss";
function App() {
  return (
    <div className={styles.main}>
      <div className={styles.navigator}>
        <Navigator />
      </div>
      <div className={styles.content}>
        <SqlQuery />
      </div>
    </div>
  );
}

export default App;
