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
const mappingEmptyPallet = Loadable({
  loader: () => import("../../views/page/STA/Receive/MappingEmptyPallet"),
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
  { path: "/receive/scanemptypallet", name: "Mapping Empty Pallet", compoment: mappingEmptyPallet, exact: true },

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
  }
];

export default routes;
