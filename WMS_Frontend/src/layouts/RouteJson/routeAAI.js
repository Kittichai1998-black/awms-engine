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
const CreateDocGiR1 = Loadable({
  loader: () => import("../../views/page/AAI/Issues/CreateDocGiR1"),
  loading: Loading
});
const CreateDocGIR2 = Loadable({
  loader: () => import("../../views/page/AAI/Issues/CreateDocGIR2"),
  loading: Loading
});
const CreateDocGIR5 = Loadable({
  loader: () => import("../../views/page/AAI/Issues/CreateDocGIR5"),
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
    compoment: CreateDocGiR1,
    exact: true
  },
  {
    path: "/issue/createR2",
    name: "base5",
    compoment: CreateDocGIR2,
    exact: true
  },
  {
    path: "/issue/createR5",
    name: "base5",
    compoment: CreateDocGIR5,
    exact: true
  }
];

export default routes;
