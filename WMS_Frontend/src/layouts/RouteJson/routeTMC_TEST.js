import Loadable from "react-loadable";
import React from "react";

function Loading() {
  return <div>Loading...</div>;
}

const DocumentViewSTA = Loadable({
  loader: () => import("../../views/page/TMC_TEST/Receive/DocumentViewGR"),
  loading: Loading
});
const CreateDocGISTA = Loadable({
  loader: () => import("../../views/page/TMC_TEST/Issues/CreateDocGI"),
  loading: Loading
});
const StorageObjectSTA = Loadable({
  loader: () => import("../../views/page/TMC_TEST/Report/StorageObject"),
  loading: Loading
});
const DocumentSearchSTA = Loadable({
  loader: () => import("../../views/page/TMC_TEST/Receive/DocumentSearchSTA"),
  loading: Loading
});
const CreateDocGR = Loadable({
  loader: () => import("../../views/page/TMC_TEST/Receive/CreateDocGR"),
  loading: Loading
});
const DocumentSearchGISTA = Loadable({
  loader: () => import("../../views/page/TMC_TEST/Issues/DocumentSearchGISTA"),
  loading: Loading
});
const DocumentViewGISTA = Loadable({
  loader: () => import("../../views/page/TMC_TEST/Issues/DocumentViewGI"),
  loading: Loading
});

const ProcessQueueGI = Loadable({
  loader: () => import("../../views/page/TMC_TEST/Issues/WorkQueueSTA"),
  loading: Loading
});

const ReceivePallet = Loadable({
  loader: () => import("../../views/page/TMC_TEST/Receive/ReceivePallet"),
  loading: Loading
});

const routes = [
  {
    path: "/receive/detail",
    name: "base5",
    compoment: DocumentViewSTA,
    exact: true
  },
  {
    path: "/receive/search",
    name: "Search GR",
    compoment: DocumentSearchSTA,
    exact: true
  },
  {
    path: "/receive/create",
    name: "Create GR",
    compoment: CreateDocGR,
    exact: true
  },
  {
    path: "/receive/receivefg",
    name: "Receive FG",
    compoment: ReceivePallet,
    exact: true
  },
  {
    path: "/issue/search",
    name: "base5",
    compoment: DocumentSearchGISTA,
    exact: true
  },
  {
    path: "/issue/create",
    name: "base5",
    compoment: CreateDocGISTA,
    exact: true
  },
  {
    path: "/issue/detail",
    name: "base5",
    compoment: DocumentViewGISTA,
    exact: true
  },
  {
    path: "/warehouse/storageobject",
    name: "base5",
    compoment: StorageObjectSTA,
    exact: true
  },
  {
    path: "/issue/managequeue",
    name: "base5",
    compoment: ProcessQueueGI,
    exact: true
  }
];

export default routes;
