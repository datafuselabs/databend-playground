import { FC, ReactElement } from "react";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
interface IProps {
  [prop: string]: any;
}
const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;
const SpinLoading: FC<IProps> = (props): ReactElement => {
  return <Spin {...props} indicator={antIcon} />;
};
export default SpinLoading;
