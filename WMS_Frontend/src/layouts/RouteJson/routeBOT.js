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
const StorageObjectReport = Loadable({
  loader: () => import("../../views/page/BOT/Report/StorageObject"),
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
const PK_Create_Wave = Loadable({
  loader: () => import("../../views/page/BOT/Issue/PK_ManageQueue"),
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
    path: "/issue/create_wave",
    name: "Create Picking",
    compoment: PK_Create_Wave,
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
  { path: "/monitor/recive", name: "Scanpallet", compoment: Scanpallet, exact: true },
];

export default routes;
