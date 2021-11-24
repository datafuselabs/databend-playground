import { FC, ReactElement } from "react";
import NoData from "@/assets/svg/noData";
const NoDataFragment: FC = (): ReactElement => {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", color: "#76aff7" }}>
      <NoData></NoData>
      No Data.
    </div>
  );
};
export default NoDataFragment;
