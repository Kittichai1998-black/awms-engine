import Loadable from "react-loadable";
import React from "react";

function Loading() {
  return <div>Loading...</div>;
}

const DocumentSearchGR = Loadable({
  loader: () => import("../../views/page/TMC/Receive/DocumentSearchGR"),
  loading: Loading
});

const routes = [
  {
    path: "/receive/search",
    name: "Search GR",
    compoment: DocumentSearchGR,
    exact: true
  }
];

export default routes;
