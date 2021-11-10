import { lazy } from "react";
import { useRoutes } from "react-router-dom";
import SqlSvg from "@/assets/svg/sql";
import TestSvg from "@/assets/svg/test";
import MainLayout from "components/Layout";

const NotFound = lazy(() => import("@/pages/NotFound"));
const Login = lazy(() => import("@/pages/Login"));
const SqlIde = lazy(() => import("@/pages/IDE"));
const Test = lazy(() => import("@/pages/Test"));

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
        label: "SQL IDE",
        icon: <SqlSvg />,
        element: <SqlIde />,
      },
      {
        label: "Test",
        path: "test",
        icon: <TestSvg />,
        element: <Test />,
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
