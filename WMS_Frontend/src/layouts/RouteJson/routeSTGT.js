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
const CreateDocGISTGT = Loadable({
  loader: () => import("../../views/page/STGT/Issues/CreateDocGISTGT"),
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
    compoment: CreateDocGISTGT,
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
        path: "/dashboard/pickingjobs",
        name: "TestRedirect",
        compoment: dashboardPickingJob, exact: true
    },
    {
        path: "/dashboard/countingjobs",
        name: "TestRedirect", compoment:
        dashboardCountingJob, exact: true
    },

];

export default routes;
