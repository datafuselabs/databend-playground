import { lazy } from "react";
import { useRoutes } from "react-router-dom";
import SqlSvg from "@/assets/svg/sql";
import MainLayout from "components/Layout";

const NotFound = lazy(() => import("@/pages/NotFound"));
const Login = lazy(() => import("@/pages/Login"));
const SqlIde = lazy(() => import("@/pages/IDE"));

interface IRouteObject {
  children?: IRouteObject[];
  element?: React.ReactNode;
  index?: boolean;
  path?: string;
  to?: string;
  label?: string;
  icon?: React.ReactNode;
}
export const allRouter: IRouteObject[] = [
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        path: "/",
        label: "Editor",
        icon: <SqlSvg />,
        element: <SqlIde />,
      },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
];
export const AppRouters = () => useRoutes(allRouter);
