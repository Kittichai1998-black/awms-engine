import Loadable from "react-loadable";
import React from "react";

function Loading() {
  return <div>Loading...</div>;
}


const StorageObjectFull = Loadable({
  loader: () => import("../../views/page/BOT/Warehouse/StorageObjectFull"),
  loading: Loading
});
const StorageObject = Loadable({
  loader: () => import("../../views/page/BOT/Warehouse/StorageObject"),
  loading: Loading
});
const GR_Search = Loadable({
  loader: () => import("../../views/page/BOT/GR/GR_Search"),
  loading: Loading
});

const GR_Create = Loadable({
  loader: () => import("../../views/page/BOT/GR/GR_Create"),
  loading: Loading
});
const GR_Detail = Loadable({
  loader: () => import("../../views/page/BOT/GR/GR_Detail"),
  loading: Loading
});
const PA_Create = Loadable({
  loader: () => import("../../views/page/BOT/PA/PA_Create"),
  loading: Loading
});
const PA_Detail = Loadable({
  loader: () => import("../../views/page/BOT/PA/PA_Detail"),
  loading: Loading
});
const PA_Search = Loadable({
  loader: () => import("../../views/page/BOT/PA/PA_Search"),
  loading: Loading
});
const GI_Search = Loadable({
  loader: () => import("../../views/page/BOT/GI/GI_Search"),
  loading: Loading
});

const GI_Create = Loadable({
  loader: () => import("../../views/page/BOT/GI/GI_Create"),
  loading: Loading
});

const GI_Detail = Loadable({
  loader: () => import("../../views/page/BOT/GI/GI_Detail"),
  loading: Loading
});

const PI_Create = Loadable({
    loader: () => import("../../views/page/BOT/PI/PI_Create"),
    loading: Loading
});
const PI_Detail = Loadable({
    loader: () => import("../../views/page/BOT/PI/PI_Detail"),
    loading: Loading
});
const PI_Search = Loadable({
    loader: () => import("../../views/page/BOT/PI/PI_Search"),
    loading: Loading
});

const PI_ManageQueue = Loadable({
    loader: () => import("../../views/page/BOT/PI/PI_ManageQueue"),
    loading: Loading
});


const PK_Search = Loadable({
  loader: () => import("../../views/page/BOT/PK/PK_Search"),
  loading: Loading
});

const PK_Create = Loadable({
  loader: () => import("../../views/page/BOT/PK/PK_Create"),
  loading: Loading
});

const PK_Detail = Loadable({
  loader: () => import("../../views/page/BOT/PK/PK_Detail"),
  loading: Loading
});


const Scanpallet = Loadable({
  loader: () => import("../../views/page/BOT/Recive/ScanPallet"),
  loading: Loading
});
const CurrentInventory = Loadable({
  loader: () => import("../../views/page/BOT/Report/CurrentInventory"),
  loading: Loading
});
const StockCard = Loadable({
  loader: () => import("../../views/page/BOT/Report/StockCard"),
  loading: Loading
});
const StorageObjectReport = Loadable({
  loader: () => import("../../views/page/BOT/Report/StorageObject"),
  loading: Loading
});
const DailySTOReceive = Loadable({
  loader: () => import("../../views/page/BOT/Report/DailySTOReceive"),
  loading: Loading
});
const DailySTOIssue = Loadable({
  loader: () => import("../../views/page/BOT/Report/DailySTOIssue"),
  loading: Loading
});
const DailySTOAudit = Loadable({
  loader: () => import("../../views/page/BOT/Report/DailySTOAudit"),
  loading: Loading
});
const DailySTOSumReceive = Loadable({
  loader: () => import("../../views/page/BOT/Report/DailySTOSumReceive"),
  loading: Loading
});
const DailySTOSumIssue = Loadable({
  loader: () => import("../../views/page/BOT/Report/DailySTOSumIssue"),
  loading: Loading
});
const DailySTOSumAudit = Loadable({
  loader: () => import("../../views/page/BOT/Report/DailySTOSumAudit"),
  loading: Loading
});
const MoveLocation = Loadable({
  loader: () => import("../../views/page/BOT/Warehouse/MoveLocation"),
  loading: Loading
});
const MonitorPicking = Loadable({
  loader: () => import("../../views/page/BOT/Warehouse/MonitorWorkingPD"),
  loading: Loading
});
const routes = [
  {
    path: "/warehouse/storageobjectFull",
    name: "StorageObject",
    compoment: StorageObjectFull,
    exact: true
  },
  {
    path: "/warehouse/storageobject",
    name: "StorageObject",
    compoment: StorageObject,
    exact: true
  },

  {
    path: "/report/storageobject",
    name: "StorageObject",
    compoment: StorageObjectReport,
    exact: true
  },


  { path: "/issue/create", name: "GI Create", compoment: GI_Create, exact: true },
  { path: "/issue/detail", name: "GI View", compoment: GI_Detail, exact: true },
  { path: "/issue/search", name: "GI View", compoment: GI_Search, exact: true },
   { path: "/issue/pickingcreate", name: "PK Create", compoment: PK_Create, exact: true },
  { path: "/issue/pickingdetail", name: "PK View", compoment: PK_Detail, exact: true },
  { path: "/issue/pickingsearch", name: "PK View", compoment: PK_Search, exact: true },

  { path: "/receive/create", name: "GR Create", compoment: GR_Create, exact: true },
  { path: "/receive/detail", name: "GR View", compoment: GR_Detail, exact: true },
  { path: "/receive/search", name: "GR View", compoment: GR_Search, exact: true },
  { path: "/receive/putawaycreate", name: "PA Create", compoment: PA_Create, exact: true },
  { path: "/receive/putawaydetail", name: "PA View", compoment: PA_Detail, exact: true },
  { path: "/receive/putawaysearch", name: "PA View", compoment: PA_Search, exact: true },
  { path: "/receive/rec", name: "Scanpallet", compoment: Scanpallet, exact: true },
  {
    path: "/report/storageobject",
    name: "StorageObject",
    compoment: StorageObjectReport,
    exact: true
  },
  { path: "/report/currentinventory", name: "Current Inventory", compoment: CurrentInventory, exact: true },
  { path: "/report/stockcard", name: "StockCard", compoment: StockCard, exact: true },
  { path: "/report/receive", name: "Receive Report", compoment: DailySTOReceive, exact: true },
  { path: "/report/issue", name: "Issue Report", compoment: DailySTOIssue, exact: true },
  { path: "/report/audit", name: "Audit Report", compoment: DailySTOAudit, exact: true },
  { path: "/report/dailyreceivesum", name: "Receive Summary Report ", compoment: DailySTOSumReceive, exact: true },
  { path: "/report/dailyissuesum", name: "Issue Summary Report ", compoment: DailySTOSumIssue, exact: true },
  { path: "/report/dailyauditsum", name: "Audit Summary Report ", compoment: DailySTOSumAudit, exact: true },
  { path: "/warehouse/move", name: "Move Location", compoment: MoveLocation, exact: true },
    { path: "/monitor/picking", name: "Monitor Picking", compoment: MonitorPicking, exact: true },

    { path: "/counting/create", name: "PI Create", compoment: PI_Create, exact: true },
    { path: "/counting/detail", name: "PI View", compoment: PI_Detail, exact: true },
    { path: "/counting/search", name: "PI View", compoment: PI_Search, exact: true },
    { path: "/counting/managequeue", name: "PI Manage Queue", compoment: PI_ManageQueue, exact: true },
];

export default routes;
