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
  loader: () => import("../../views/page/STGT/Dashboard/DashboardPickingJob"),
  loading: Loading
});
const dashboardCountingJob = Loadable({
  loader: () => import("../../views/page/STGT/Dashboard/DashboardCountingJob"),
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

const StorageObject = Loadable({
  loader: () => import("../../views/page/STGT/Report/StorageObject"),
  loading: Loading
});
const CurrentInventory = Loadable({
  loader: () => import("../../views/page/STGT/Report/CurrentInventory"),
  loading: Loading
});
const StockCard = Loadable({
  loader: () => import("../../views/page/STGT/Report/StockCard"),
  loading: Loading
});
const StorageObjectView = Loadable({
  loader: () => import("../../views/page/STGT/Report/StorageObjectView"),
  loading: Loading
});
const CurrentBoxSummary = Loadable({
  loader: () => import("../../views/page/STGT/Report/CurrentBoxSummary"),
  loading: Loading
});
const ReceiveFromCustomer = Loadable({
  loader: () => import("../../views/page/STGT/Receive/ReceiveFromCustomer"),
  loading: Loading
});
const ReceiveFromWarehouse = Loadable({
  loader: () => import("../../views/page/STGT/Receive/ReceiveFromWarehouse"),
  loading: Loading
}); 
const LoadingReturn = Loadable({
  loader: () => import("../../views/page/STGT/Issues/LoadingReturn"),
  loading: Loading
});
const ReceiveProductionLine = Loadable({
  loader: () => import("../../views/page/STGT/Receive/ReceiveProductionLine"),
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
    path: "/receive/productionLine",
    name: "Search GR",
    compoment: ReceiveProductionLine,
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
  },
  {
    path: "/receive/receiveforcustomer",
    name: "Customers Return",
    compoment: ReceiveFromCustomer,
    exact: true
  },
  { path: "/receive/receivefg", name: "Receive FG", compoment: ReceiveFromWarehouse, exact: true }, 
  { path: "/issue/loadingreturn", name: "Loading Return", compoment: LoadingReturn, exact: true },
  
];

export default routes;
