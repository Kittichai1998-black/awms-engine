import Loadable from "react-loadable";
import React from "react";

function Loading() {
  return <div>Loading...</div>;
}

const DocumentSearchGISTGT = Loadable({
  loader: () => import("../../views/page/STGT/Issues/DocumentSearchGISTGT"),
  loading: Loading
});
const DocumentViewGISTGT = Loadable({
  loader: () => import("../../views/page/STGT/Issues/DocumentViewGISTGT"),
  loading: Loading
});
const CreateDocGISTGTCUS = Loadable({
  loader: () => import("../../views/page/STGT/Issues/CreateDocGISTGTCUS"),
  loading: Loading
});
const CreateDocGISTGTWM = Loadable({
  loader: () => import("../../views/page/STGT/Issues/CreateDocGISTGTWM"),
  loading: Loading
});
const DocumentSearchSTGT = Loadable({
  loader: () => import("../../views/page/STGT/Receive/DocumentSearchSTGT"),
  loading: Loading
});
const DocumentViewGRSTGT = Loadable({
  loader: () => import("../../views/page/STGT/Receive/DocumentViewGRSTGT"),
  loading: Loading
});

const dashboardPickingJob = Loadable({
  loader: () => import("../../views/page/STA/Dashboard/DashboardPickingJob"),
  loading: Loading
});
const dashboardCountingJob = Loadable({
  loader: () => import("../../views/page/STA/Dashboard/DashboardCountingJob"),
  loading: Loading
});

const CreateDocPIPhysicalSTGT = Loadable({
  loader: () => import("../../views/page/STGT/Audit/CreateDocPIPhysicalSTGT"),
  loading: Loading
});
const CreateDocPIReworkSTGT = Loadable({
  loader: () => import("../../views/page/STGT/Audit/CreateDocPIReworkSTGT"),
  loading: Loading
});
const DocumentSearchPISTGT = Loadable({
  loader: () => import("../../views/page/STGT/Audit/DocumentSearchPISTGT"),
  loading: Loading
});
const DocumentViewPISTGT = Loadable({
  loader: () => import("../../views/page/STGT/Audit/DocumentViewPISTGT"),
  loading: Loading
});
const routes = [
  {
    path: "/issue/search",
    name: "Search GI",
    compoment: DocumentSearchGISTGT,
    exact: true
  },
  {
    path: "/issue/detail",
    name: "GI View",
    compoment: DocumentViewGISTGT,
    exact: true
  },
  {
    path: "/issue/create",
    name: "base5",
    compoment: CreateDocGISTGTCUS,
    exact: true
  },
  {
    path: "/issue/createWM",
    name: "base5",
    compoment: CreateDocGISTGTWM,
    exact: true
  },
  {
    path: "/receive/search",
    name: "Search GR",
    compoment: DocumentSearchSTGT,
    exact: true
  },
  {
    path: "/receive/detail",
    name: "base5",
    compoment: DocumentViewGRSTGT,
    exact: true
  },
  {
    path: "/counting/search",
    name: "base5",
    compoment: DocumentSearchPISTGT,
    exact: true
  },
  {
    path: "/counting/detail",
    name: "base5",
    compoment: DocumentViewPISTGT,
    exact: true
  },
  {
    path: "/counting/createPhysical",
    name: "base5",
    compoment: CreateDocPIPhysicalSTGT,
    exact: true
  },
  {
    path: "/counting/createRework",
    name: "base5",
    compoment: CreateDocPIReworkSTGT,
    exact: true
  },
  {
    path: "/dashboard/pickingjobs",
    name: "TestRedirect",
    compoment: dashboardPickingJob,
    exact: true
  },
  {
    path: "/dashboard/countingjobs",
    name: "TestRedirect",
    compoment: dashboardCountingJob,
    exact: true
  }
];

export default routes;
