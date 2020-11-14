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
  loader: () => import("../../views/page/BOT/Recive/GR_Search"),
  loading: Loading
});
const PA_Search = Loadable({
  loader: () => import("../../views/page/BOT/Recive/PA_Search"),
  loading: Loading
});
const GI_Search = Loadable({
  loader: () => import("../../views/page/BOT/Issue/GI_Search"),
  loading: Loading
});
const PK_Search = Loadable({
  loader: () => import("../../views/page/BOT/Issue/PK_Search"),
  loading: Loading
});
const AD_Search = Loadable({
  loader: () => import("../../views/page/BOT/Audit/AD_Search"),
  loading: Loading
});
const Scanpallet = Loadable({
  loader: () => import("../../views/page/BOT/Recive/ScanPallet"),
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
  {
    path: "/issue/search",
    name: "Search Issue",
    compoment: GI_Search,
    exact: true
  },
  {
    path: "/issue/pickingsearch",
    name: "Search Picking",
    compoment: PK_Search,
    exact: true
  },
  {
    path: "/audit/search",
    name: "Search Audit",
    compoment: AD_Search,
    exact: true
  },



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
];

export default routes;
