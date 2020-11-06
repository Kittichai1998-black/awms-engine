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
    path: "/receive/search",
    name: "Search Goods Receive",
    compoment: GR_Search,
    exact: true
  },
  {
    path: "/receive/putawaysearch",
    name: "Search Put Away",
    compoment: PA_Search,
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
  { path: "/scan/recive", name: "Scanpallet", compoment: Scanpallet, exact: true }
];

export default routes;
