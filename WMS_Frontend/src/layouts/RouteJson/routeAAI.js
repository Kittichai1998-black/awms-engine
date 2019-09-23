import Loadable from "react-loadable";
import React from "react";

function Loading() {
  return <div>Loading...</div>;
}

const DocumentSearchGI = Loadable({
  loader: () => import("../../views/page/AAI/Issues/DocumentSearchGI"),
  loading: Loading
});
const DocumentViewGI = Loadable({
  loader: () => import("../../views/page/AAI/Issues/DocumentViewGI"),
  loading: Loading
});
const DocumentSearchGR = Loadable({
  loader: () => import("../../views/page/AAI/Receive/DocumentSearch"),
  loading: Loading
});
const DocumentViewGR = Loadable({
  loader: () => import("../../views/page/AAI/Receive/DocumentViewGR"),
  loading: Loading
});
const ReceiveEmptyPallet = Loadable({
  loader: () => import("../../views/page/AAI/Receive/ReceiveEmptyPallet"),
  loading: Loading
});
const CreateDocGIR1 = Loadable({
  loader: () => import("../../views/page/AAI/Issues/CreateDocGIR1"),
  loading: Loading
});
const CreateDocGIR2 = Loadable({
  loader: () => import("../../views/page/AAI/Issues/CreateDocGIR2"),
  loading: Loading
});
const CreateDocGIR3 = Loadable({
  loader: () => import("../../views/page/AAI/Issues/CreateDocGIR3"),
  loading: Loading
});
const CreateDocGIR4 = Loadable({
  loader: () => import("../../views/page/AAI/Issues/CreateDocGIR4"),
  loading: Loading
});
const CreateDocGIR5 = Loadable({
  loader: () => import("../../views/page/AAI/Issues/CreateDocGIR5"),
  loading: Loading
});
const CreateDocGIR6 = Loadable({
  loader: () => import("../../views/page/AAI/Issues/CreateDocGIR6"),
  loading: Loading
});

const WorkQueueGroup1 = Loadable({
  loader: () => import("../../views/page/AAI/Issues/WorkQueueAAIGroup"), //R1 R2 R4 R5
  loading: Loading
});

const WorkQueueAAIR3 = Loadable({
  loader: () => import("../../views/page/AAI/Issues/WorkQueueAAIR3"),
  loading: Loading
});

const WorkQueueAAIR6 = Loadable({
  loader: () => import("../../views/page/AAI/Issues/WorkQueueAAIR6"),
  loading: Loading
});

const StorageObject = Loadable({
  loader: () => import("../../views/page/AAI/Warehouse/StorageObject"),
  loading: Loading
});

const routes = [
  {
    path: "/issue/search",
    name: "Search GI",
    compoment: DocumentSearchGI,
    exact: true
  },
  {
    path: "/issue/detail",
    name: "GI View",
    compoment: DocumentViewGI,
    exact: true
  },
  {
    path: "/receive/receivemptypallet",
    name: "Mapping Empty Pallet",
    compoment: ReceiveEmptyPallet,
    exact: true
  },
  {
    path: "/receive/search",
    name: "Search GR",
    compoment: DocumentSearchGR,
    exact: true
  },
  {
    path: "/receive/detail",
    name: "base5",
    compoment: DocumentViewGR,
    exact: true
  },
  {
    path: "/issue/createR1",
    name: "base5",
    compoment: CreateDocGIR1,
    exact: true
  },
  {
    path: "/issue/createR2",
    name: "base5",
    compoment: CreateDocGIR2,
    exact: true
  },
  {
    path: "/issue/createR3",
    name: "base5",
    compoment: CreateDocGIR3,
    exact: true
  },
  {
    path: "/issue/createR4",
    name: "base5",
    compoment: CreateDocGIR4,
    exact: true
  },
  {
    path: "/issue/createR5",
    name: "base5",
    compoment: CreateDocGIR5,
    exact: true
  },
  {
    path: "/issue/createR6",
    name: "base5",
    compoment: CreateDocGIR6,
    exact: true
  },
  {
    path: "/issue/managequeue",
    name: "base5",
    compoment: WorkQueueGroup1,
    exact: true
  },
  {
    path: "/issue/managequeueR3",
    name: "base5",
    compoment: WorkQueueAAIR3,
    exact: true
  },
  {
    path: "/issue/managequeueR6",
    name: "base5",
    compoment: WorkQueueAAIR6,
    exact: true
  },
  {
    path: "/warehouse/storageobject",
    name: "base5",
    compoment: StorageObject,
    exact: true
  }
];

export default routes;
