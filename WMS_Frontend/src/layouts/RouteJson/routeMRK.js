import Loadable from "react-loadable";
import React from "react";

function Loading() {
  return <div>Loading...</div>;
}

const searchGR = Loadable({
  loader: () => import("../../views/page/MRK/Receive/searchGR"),
  loading: Loading
});
const createGR = Loadable({
  loader: () => import("../../views/page/MRK/Receive/createGR"),
  loading: Loading
});
const viewGR = Loadable({
  loader: () => import("../../views/page/MRK/Receive/viewGR"),
  loading: Loading
});
const viewGRSup = Loadable({
  loader: () => import("../../views/page/MRK/Receive/viewGRSup"),
  loading: Loading
});
const searchGI = Loadable({
  loader: () => import("../../views/page/MRK/Issue/searchGI"),
  loading: Loading
});
const createGI = Loadable({
  loader: () => import("../../views/page/MRK/Issue/createGI"),
  loading: Loading
});
const viewGI = Loadable({
  loader: () => import("../../views/page/MRK/Issue/viewGI"),
  loading: Loading
});
const searchPI = Loadable({
  loader: () => import("../../views/page/MRK/Counting/searchPI"),
  loading: Loading
});
const createPI = Loadable({
  loader: () => import("../../views/page/MRK/Counting/createPI"),
  loading: Loading
});
const viewPI = Loadable({
  loader: () => import("../../views/page/MRK/Counting/viewPI"),
  loading: Loading
});
const PrintLabelProduct = Loadable({
  loader: () => import("../../views/page/MRK/Product/PrintLabelProduct"),
  loading: Loading
});
const dashboardPickingJob = Loadable({
  loader: () => import("../../views/page/MRK/Dashboard/DashboardPickingJob"),
  loading: Loading
});
const ProcessQueueGI = Loadable({
  loader: () => import("../../views/page/MRK/Issue/WorkQueueMRK"),
  loading: Loading
});
const ProcessQueueCT = Loadable({
  loader: () => import("../../views/page/MRK/Counting/WorkQueueMRKCounting"),
  loading: Loading
});
const CountingAdj = Loadable({
  loader: () => import("../../views/page/MRK/Counting/CountingAdj"),
  loading: Loading
});
const CreateDocCUS = Loadable({
  loader: () => import("../../views/page/MRK/Receive/CreateDocCUS"),
  loading: Loading
});
const CreateDocSUP = Loadable({
  loader: () => import("../../views/page/MRK/Receive/CreateDocSUP"),
  loading: Loading
});

const routes = [
  { path: "/receive/create", name: "base5", compoment: createGR, exact: true },
  {
    path: "/receive/fromcustomers",
    name: "base5",
    compoment: CreateDocCUS,
    exact: true
  },
  {
    path: "/receive/fromsuppliers",
    name: "base5",
    compoment: CreateDocSUP,
    exact: true
  },
  { path: "/receive/search", name: "base5", compoment: searchGR, exact: true },
  { path: "/receive/detail", name: "base5", compoment: viewGR, exact: true },
  {
    path: "/receive/detailSup",
    name: "base5",
    compoment: viewGRSup,
    exact: true
  },
  { path: "/issue/create", name: "base5", compoment: createGI, exact: true },
  { path: "/issue/search", name: "base5", compoment: searchGI, exact: true },
  { path: "/issue/detail", name: "base5", compoment: viewGI, exact: true },
  {
    path: "/issue/managequeue",
    name: "base5",
    compoment: ProcessQueueGI,
    exact: true
  },
  {
    path: "/counting/managequeue",
    name: "base5",
    compoment: ProcessQueueCT,
    exact: true
  },
  { path: "/counting/detail", name: "base5", compoment: viewPI, exact: true },
  { path: "/counting/search", name: "base5", compoment: searchPI, exact: true },
  { path: "/counting/create", name: "base5", compoment: createPI, exact: true },
  {
    path: "/counting/manualcounting",
    name: "base5",
    compoment: CountingAdj,
    exact: true
  },
  {
    path: "/warehouse/printbarcode",
    name: "Print Barcode Product",
    compoment: PrintLabelProduct,
    exact: true
  },
  {
    path: "/dashboard/pickingjobs",
    name: "Dashboard Gate Picking Return by GR",
    compoment: dashboardPickingJob,
    exact: true
  }
];

export default routes;
