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
const GR_Search = Loadable({
  loader: () => import("../../views/page/BOT/GR/GR_Search"),
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

  { path: "/scan/recive", name: "Scanpallet", compoment: Scanpallet, exact: true },
  { path: "/receive/create", name: "GR Create", compoment: GR_Create, exact: true },
  { path: "/receive/detail", name: "GR View", compoment: GR_Detail, exact: true },
  { path: "/receive/search", name: "GR View", compoment: GR_Search, exact: true },
  { path: "/receive/putawaycreate", name: "PA Create", compoment: PA_Create, exact: true },
  { path: "/receive/putawaydetail", name: "PA View", compoment: PA_Detail, exact: true },
  { path: "/receive/putawaysearch", name: "PA View", compoment: PA_Search, exact: true },

];

export default routes;
