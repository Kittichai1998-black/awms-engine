import Loadable from "react-loadable";
import React from "react";

function Loading() {
  return <div>Loading...</div>;
}

const DocumentSearchTAP = Loadable({
  loader: () => import("../../views/page/TAP/Recieve/DocumentSearchTAP"),
  loading: Loading
});
const DocumentViewGRTAP = Loadable({
  loader: () => import("../../views/page/TAP/Recieve/DocumentViewGRTAP"),
  loading: Loading
});
const DocumentSearchGITAP = Loadable({
  loader: () => import("../../views/page/TAP/Issues/DocumentSearchGITAP"),
  loading: Loading
});
const DocumentViewGITAP = Loadable({
  loader: () => import("../../views/page/TAP/Issues/DocumentViewGITAP"),
  loading: Loading
});
const DocumentSearchPITAP = Loadable({
  loader: () => import("../../views/page/TAP/Audit/DocumentSearchPITAP"),
  loading: Loading
});
const DocumentViewPITAP = Loadable({
  loader: () => import("../../views/page/TAP/Audit/DocumentViewPITAP"),
  loading: Loading
});
const CreateDocGITAPCUS = Loadable({
  loader: () => import("../../views/page/TAP/Issues/CreateDocGITAPCUS"),
  loading: Loading
});
const CreateDocGITAPWM = Loadable({
  loader: () => import("../../views/page/TAP/Issues/CreateDocGITAPWM"),
  loading: Loading
});
const CreateDocPITAP = Loadable({
  loader: () => import("../../views/page/TAP/Audit/CreateDocPITAP"),
  loading: Loading
});
const RecieveCrossDock = Loadable({
  loader: () => import("../../views/page/TAP/Issues/RecieveCrossDockNew"),
  loading: Loading
});
const RejectCrossDock = Loadable({
  loader: () => import("../../views/page/TAP/Issues/RejectCrossDock"),
  loading: Loading
});
const ProcessQueueGI = Loadable({
  loader: () => import("../../views/page/TAP/Issues/WorkQueueTAP"),
  loading: Loading
});
const ProcessQueueCT = Loadable({
  loader: () => import("../../views/page/TAP/Audit/WorkQueueTAPCounting"),
  loading: Loading
});
const dashboardCounting = Loadable({
  loader: () => import("../../views/page/TAP/Dashboard/DashboardCounting"),
  loading: Loading
});
const dashboardPickingJob = Loadable({
  loader: () => import("../../views/page/TAP/Dashboard/DashboardPickingJob"),
  loading: Loading
});
const StorageObject = Loadable({
  loader: () => import("../../views/page/TAP/Report/StorageObject"),
  loading: Loading
});
const CurrentInventory = Loadable({
  loader: () => import("../../views/page/TAP/Report/CurrentInventory"),
  loading: Loading
});
const StockCard = Loadable({
  loader: () => import("../../views/page/TAP/Report/StockCard"),
  loading: Loading
});
const StorageObjectView = Loadable({
  loader: () => import("../../views/page/TAP/Report/StorageObjectView"),
  loading: Loading
});
const CurrentBoxSummary = Loadable({
  loader: () => import("../../views/page/TAP/Report/CurrentBoxSummary"),
  loading: Loading
});

const routes = [
  {
    path: "/receive/search",
    name: "Search GR",
    compoment: DocumentSearchTAP,
    exact: true
  },
  {
    path: "/receive/detail",
    name: "base5",
    compoment: DocumentViewGRTAP,
    exact: true
  },
  {
    path: "/issue/createCus",
    name: "base5",
    compoment: CreateDocGITAPCUS,
    exact: true
  },
  {
    path: "/issue/createWm",
    name: "base5",
    compoment: CreateDocGITAPWM,
    exact: true
  },
  {
    path: "/issue/search",
    name: "base5",
    compoment: DocumentSearchGITAP,
    exact: true
  },
  {
    path: "/issue/detail",
    name: "base5",
    compoment: DocumentViewGITAP,
    exact: true
  },
  {
    path: "/issue/createCus",
    name: "base5",
    compoment: CreateDocGITAPCUS,
    exact: true
  },
  {
    path: "/issue/createWm",
    name: "base5",
    compoment: CreateDocGITAPWM,
    exact: true
  },
  {
    path: "/issue/search",
    name: "base5",
    compoment: DocumentSearchGITAP,
    exact: true
  },
  {
    path: "/issue/detail",
    name: "base5",
    compoment: DocumentViewGITAP,
    exact: true
  },
  {
    path: "/receive/crossdock",
    name: "base5",
    compoment: RecieveCrossDock,
    exact: true
  },
  {
    path: "/receive/closeCrossdock",
    name: "base5",
    compoment: RejectCrossDock,
    exact: true
  },
  {
    path: "/counting/create",
    name: "base5",
    compoment: CreateDocPITAP,
    exact: true
  },
  {
    path: "/counting/search",
    name: "base5",
    compoment: DocumentSearchPITAP,
    exact: true
  },
  {
    path: "/counting/detail",
    name: "base5",
    compoment: DocumentViewPITAP,
    exact: true
  },
  {
    path: "/counting/detail",
    name: "base5",
    compoment: DocumentViewPITAP,
    exact: true
  },
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
  {
    path: "/dashboard/countingjobs",
    name: "TestRedirect",
    compoment: dashboardCounting,
    exact: true
  },
  {
    path: "/dashboard/pickingjobs",
    name: "TestRedirect",
    compoment: dashboardPickingJob,
    exact: true
  },
  {
    path: "/warehouse/storageobject",
    name: "base5",
    compoment: StorageObject,
    exact: true
  },
  {
    path: "/report/currentinventory",
    name: "Current Inventory",
    compoment: CurrentInventory,
    exact: true
  },
  {
    path: "/report/stockcard",
    name: "StockCard",
    compoment: StockCard,
    exact: true
  },
  {
    path: "/report/storageobject",
    name: "base5",
    compoment: StorageObjectView,
    exact: true
  },
  {
    path: "/report/currentboxsummary",
    name: "base5",
    compoment: CurrentBoxSummary,
    exact: true
  }
];

export default routes;
