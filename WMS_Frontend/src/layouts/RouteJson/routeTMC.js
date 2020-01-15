import Loadable from "react-loadable";
import React from "react";

function Loading() {
  return <div>Loading...</div>;
}

const DocumentSearchGR = Loadable({
  loader: () => import("../../views/page/TMC/Receive/DocumentSearchGR"),
  loading: Loading
});
const DocumentViewGR = Loadable({
  loader: () => import("../../views/page/TMC/Receive/DocumentViewGR"),
  loading: Loading
});
const DocumentViewGI = Loadable({
  loader: () => import("../../views/page/TMC/Issues/DocumentViewGI"),
  loading: Loading
});
const DocumentSearchGI = Loadable({
  loader: () => import("../../views/page/TMC/Issues/DocumentSearchGI"),
  loading: Loading
});

const routes = [
  {
    path: "/receive/search",
    name: "Search GR",
    compoment: DocumentSearchGR,
    exact: true
  },
  {
    path: "/receive/detail",
    name: "Search GR",
    compoment: DocumentViewGR,
    exact: true
  },
  {
    path: "/issue/detail",
    name: "GI View",
    compoment: DocumentViewGI,
    exact: true
  },
  {
    path: "/issue/search",
    name: "Search GI",
    compoment: DocumentSearchGI,
    exact: true
  }
];

export default routes;
