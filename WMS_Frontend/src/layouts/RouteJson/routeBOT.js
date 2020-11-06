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
  }
];

export default routes;